import { ClientError } from "./clientError.ts";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/** True only for a file input the user actually filled; an empty one still submits a 0-byte File. */
export function isFilledFile(value: unknown): value is File {
  return value instanceof File && value.size > 0;
}

/**
 * Validates an uploaded image and writes it to the Worker's R2 bucket.
 *
 * The name is derived from the owner plus a timestamp and a random suffix rather than from the client-supplied filename, which keeps path traversal and collisions out of the picture entirely.
 *
 * @returns the root-relative path to store in the database (`/public/uploads/...`), which `getAssetUrl` on the frontend resolves against the backend origin.
 * @throws {ClientError} when the type or the size is not allowed.
 */
export default async function uploadImage(
  bucket: R2Bucket,
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
  const fileName = `${ownerId}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const objectKey = `uploads/${subdirectory}/${fileName}`;

  await bucket.put(objectKey, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return `/public/${objectKey}`;
}
