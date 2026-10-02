import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema.ts";

/** Create a request-scoped Drizzle client from the Worker's D1 binding. */
export function createDb(binding: D1Database) {
  return drizzle(binding, { schema, casing: "snake_case" });
}

export type Database = ReturnType<typeof createDb>;
