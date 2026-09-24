import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { ClientError } from "./clientError.ts";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Railway mounts the app's persistent volume at /data. Keeping uploads there prevents the database from retaining URLs whose files disappear on deploy.
// Local development continues to use the repository's public directory.
export const UPLOAD_DIRECTORY =
  process.env.NODE_ENV === "production" ? "/data/uploads" : "public/uploads";

/** True only for a file input the user actually filled; an empty one still submits a 0-byte File. */
export function isFilledFile(value: unknown): value is File {
  return value instanceof File && value.size > 0;
}

/**
 * Validates an uploaded image and writes it under `public/uploads/<subdirectory>/`.
 *
 * The name is derived from the owner plus a timestamp and a random suffix rather than from the client-supplied filename, which keeps path traversal and collisions out of the picture entirely.
 *
 * @returns the root-relative path to store in the database (`/public/uploads/...`), which `getAssetUrl` on the frontend resolves against the backend origin.
 * @throws {ClientError} when the type or the size is not allowed.
 */
export default async function uploadImage(
  file: File,
  subdirectory: string,
  ownerId: number | string,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ClientError(
      "Invalid file type. Only JPEG, PNG and WEBP are allowed",
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new ClientError("File size exceeds the 5MB limit");
  }

  const extension = file.type.split("/")[1];
  const fileName = `${ownerId}-${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;

  const uploadDir = path.join(UPLOAD_DIRECTORY, subdirectory);

  // The upload directory does not exist until the first upload ever happens
  await fs.mkdir(uploadDir, { recursive: true });

  await fs.writeFile(
    path.join(uploadDir, fileName),
    Buffer.from(await file.arrayBuffer()),
  );

  return `/public/uploads/${subdirectory}/${fileName}`;
}
