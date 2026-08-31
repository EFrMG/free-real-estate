import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/libsql/migrator";

import { db } from "./index.ts";

// Resolves to backends/node-drizzle/drizzle whether this runs from src/db/migrate.ts (tsx) or the compiled dist/db/migrate.js.
const migrationsFolder = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "drizzle",
);

/**
 * Applies any pending SQL migrations from ./drizzle. Idempotent, so it's safe to call on every boot (see index.ts) as well as run standalone.
 */
export async function runMigrations(): Promise<void> {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder });
  console.log("Migrations up to date.");
}

// CLI entry point: only runs when this file is executed directly:
// `pnpm migrate` / `tsx src/db/migrate.ts`, not when imported by the server
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
}
