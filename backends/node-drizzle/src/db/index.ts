import "dotenv/config";
import fs from "node:fs";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema.ts";

// Ensure the volume directory exists before libsql tries to open the database file
// This is only relevant on Railway, where a persistent volume is mounted at /data; locally there's no such mount (and no permission to create one at the filesystem root), so ignore that specific failure and fall back to DB_FILE_NAME as-is
try {
  fs.mkdirSync("/data", { recursive: true });
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== "EACCES") throw err;
}

const client = createClient({ url: process.env.DB_FILE_NAME! });
export const db = drizzle({ client, schema, casing: "snake_case" });
