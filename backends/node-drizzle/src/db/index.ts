import "dotenv/config";
import fs from "node:fs";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema.ts";

// Ensure the volume directory exists before libsql tries to open the
// database file. This module is imported (and this code runs) before
// main() in src/index.ts gets a chance to create the directory, so we
// must synchronously guarantee it exists here to avoid a cryptic
// ConnectionFailed("... : 14") error from libsql.
fs.mkdirSync("/data", { recursive: true });

const client = createClient({ url: process.env.DB_FILE_NAME! });
export const db = drizzle({ client, schema, casing: "snake_case" });
