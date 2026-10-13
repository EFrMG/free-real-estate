import { ClientError } from "./clientError.ts";

export const MAX_SITE_IMAGES = 50;
export const MAX_SITE_BYTES = 50 * 1024 * 1024;
const INITIALIZATION_LEASE_MS = 10_000;
const INITIALIZATION_WAIT_MS = 12_000;
const INITIALIZATION_POLL_MS = 250;

/** Initialize the counter from existing R2 objects before accepting the first new upload. */
async function initializeQuota(
  db: D1Database,
  bucket: R2Bucket,
): Promise<void> {
  const deadline = Date.now() + INITIALIZATION_WAIT_MS;
  do {
    const row = await db
      .prepare("SELECT initialized FROM upload_quota WHERE id = 1")
      .first<{ initialized: number }>();
    if (!row) {
      await db
        .prepare("INSERT OR IGNORE INTO upload_quota (id) VALUES (1)")
        .run();
      continue;
    }
    if (row.initialized === 1) return;

    const now = Date.now();
    const token = crypto.randomUUID();
    const claimed = await db
      .prepare(
        "UPDATE upload_quota SET initialized = -1, lease_until = ?, lease_token = ? WHERE id = 1 AND initialized != 1 AND lease_until < ?",
      )
      .bind(now + INITIALIZATION_LEASE_MS, token, now)
      .run();

    if (claimed.meta.changes) {
      let count = 0;
      let bytes = 0;
      let cursor: string | undefined;

      try {
        do {
          const page = await bucket.list({ prefix: "uploads/", cursor });
          count += page.objects.length;
          bytes += page.objects.reduce(
            (total, object) => total + object.size,
            0,
          );
          cursor = page.truncated ? page.cursor : undefined;
        } while (cursor);

        const result = await db
          .prepare(
            "UPDATE upload_quota SET image_count = ?, total_bytes = ?, initialized = 1, lease_until = 0, lease_token = NULL WHERE id = 1 AND lease_token = ?",
          )
          .bind(count, bytes, token)
          .run();
        if (result.meta.changes) return;
      } catch (error) {
        await db
          .prepare(
            "UPDATE upload_quota SET initialized = 0, lease_until = 0, lease_token = NULL WHERE id = 1 AND lease_token = ?",
          )
          .bind(token)
          .run();
        throw error;
      }
    }

    const remaining = deadline - Date.now();
    if (remaining > 0)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(INITIALIZATION_POLL_MS, remaining)),
      );
  } while (Date.now() < deadline);

  throw new Error("Upload quota initialization timed out");
}

export async function reserveImage(
  db: D1Database,
  bucket: R2Bucket,
  size: number,
): Promise<void> {
  await initializeQuota(db, bucket);
  const result = await db
    .prepare(
      "UPDATE upload_quota SET image_count = image_count + 1, total_bytes = total_bytes + ? WHERE id = 1 AND image_count < ? AND total_bytes + ? <= ?",
    )
    .bind(size, MAX_SITE_IMAGES, size, MAX_SITE_BYTES)
    .run();

  if (!result.meta.changes) {
    throw new ClientError(
      "The site upload limit of 50 images or 50 MB has been reached.",
    );
  }
}

export async function releaseImage(
  db: D1Database,
  size: number,
): Promise<void> {
  await db
    .prepare(
      "UPDATE upload_quota SET image_count = image_count - 1, total_bytes = total_bytes - ? WHERE id = 1",
    )
    .bind(size)
    .run();
}

export async function deleteImage(
  db: D1Database,
  bucket: R2Bucket,
  path: string,
  owner?: { directory: "properties" | "profile-pictures"; id: number },
): Promise<void> {
  if (!path.startsWith("/public/uploads/")) return;

  const key = path.slice("/public/".length);
  if (owner && !key.startsWith(`uploads/${owner.directory}/${owner.id}-`))
    return;

  const object = await bucket.head(key);
  if (!object) return;

  await bucket.delete(key);
  await releaseImage(db, object.size);
}

/** Remove demo uploads after the daily database reset has removed their references. */
export async function clearUploads(
  db: D1Database,
  bucket: R2Bucket,
): Promise<void> {
  let page = await bucket.list({ prefix: "uploads/" });
  while (page.objects.length) {
    await bucket.delete(page.objects.map((object) => object.key));
    if (!page.truncated) break;
    page = await bucket.list({ prefix: "uploads/" });
  }

  await db
    .prepare(
      "UPDATE upload_quota SET image_count = 0, total_bytes = 0, initialized = 1, lease_until = 0, lease_token = NULL WHERE id = 1",
    )
    .run();
}
