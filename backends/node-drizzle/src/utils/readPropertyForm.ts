import type { Context } from "hono";

import { ClientError } from "./clientError.ts";
import uploadImage, { isFilledFile } from "./uploadImage.ts";

const JSON_FIELDS = ["interiorGallery", "sizes", "nearbyPlaces"];
const FILE_FIELDS = ["exteriorFile", "galleryFiles"];
// Optional fields an edit is allowed to blank out
// Every other empty text field means "leave this alone," since a partial update only carries what it changes
const CLEARABLE_FIELDS = ["longDescription"];

/**
 * Normalizes a property create/update request into a plain object ready for zod.
 *
 * A JSON body passes through untouched. A multipart body additionally:
 *   - writes the `exteriorFile` and `galleryFiles` uploads to disk, folding the paths they were stored at into `exteriorImage` and `interiorGallery`
 *   - decodes the JSON-encoded `interiorGallery`, `sizes` and `nearbyPlaces` fields
 *   - drops empty text fields other than `CLEARABLE_FIELDS`, so a partial update leaves them at their stored value instead of blanking them
 *
 * @param ownerId the agent the uploads are named after.
 * @throws {ClientError} on a malformed JSON field or a rejected upload.
 */
export default async function readPropertyForm(
  c: Context,
  ownerId: number,
): Promise<Record<string, unknown>> {
  const contentType = c.req.header("Content-Type") ?? "";

  if (!contentType.includes("multipart/form-data")) return await c.req.json();

  // `all` keeps every entry of a repeated field (the gallery uploads) rather than only the last one
  const body = await c.req.parseBody({ all: true });

  const entries = Object.entries(body).map(
    ([key, value]) =>
      [key, Array.isArray(value) ? value : [value]] as [string, unknown[]],
  );

  const valuesOf = (name: string) =>
    entries.find(([key]) => key === name)?.[1] ?? [];

  const payload: Record<string, unknown> = {};

  // Plain text fields
  for (const [key, values] of entries) {
    if (FILE_FIELDS.includes(key) || JSON_FIELDS.includes(key)) continue;

    const value = values.at(-1);

    if (typeof value !== "string") continue;

    if (value !== "" || CLEARABLE_FIELDS.includes(key)) payload[key] = value;
  }

  // Structured fields
  for (const key of JSON_FIELDS) {
    const value = valuesOf(key).at(-1);

    if (typeof value !== "string" || value === "") continue;

    try {
      payload[key] = JSON.parse(value);
    } catch {
      throw new ClientError(`The ${key} field was not valid JSON.`);
    }
  }

  // A new exterior image replaces whatever path the form came in with
  const exteriorFile = valuesOf("exteriorFile").find(isFilledFile);

  if (exteriorFile) {
    payload["exteriorImage"] = await uploadImage(
      exteriorFile,
      "properties",
      ownerId,
    );
  }

  // Gallery uploads are appended to whichever existing images the form kept
  const galleryFiles = valuesOf("galleryFiles").filter(isFilledFile);

  if (galleryFiles.length) {
    const uploaded: string[] = [];

    for (const file of galleryFiles) {
      uploaded.push(await uploadImage(file, "properties", ownerId));
    }

    const kept = payload["interiorGallery"];

    payload["interiorGallery"] = [
      ...(Array.isArray(kept) ? kept : []),
      ...uploaded,
    ];
  }

  return payload;
}
