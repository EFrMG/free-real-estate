import { drizzle } from "drizzle-orm/d1";

/**
 * Create a request-scoped Drizzle client from the Worker's D1 binding.
 *
 * No `schema` is passed on purpose: it only feeds the relational `db.query.*` API, which nothing here uses, and building its metadata on every request costs CPU. Tables are imported from `./schema.ts` wherever they are queried.
 */
export function createDb(binding: D1Database) {
  return drizzle(binding, { casing: "snake_case" });
}

export type Database = ReturnType<typeof createDb>;
