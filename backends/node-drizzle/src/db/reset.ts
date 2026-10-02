import type { Database } from "./index.ts";
import { seedDatabase } from "./seed.ts";

/** Reset the demo data when invoked by the Worker's daily Cron Trigger. */
export async function resetDatabase(db: Database): Promise<void> {
  console.log("Running scheduled daily database reset...");
  await seedDatabase(db);
  console.log("Scheduled database reset complete.");
}
