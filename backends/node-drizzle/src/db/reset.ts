import { seedDatabase } from "./seed.ts";

const RESET_HOUR_UTC = Number(process.env.RESET_HOUR_UTC ?? 0);

function msUntilNextReset(): number {
  const now = new Date();
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      RESET_HOUR_UTC,
      0,
      0,
      0,
    ),
  );

  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);

  return next.getTime() - now.getTime();
}

function scheduleNext(): void {
  const delay = msUntilNextReset();
  console.log(
    `Next automatic database reset in ${(delay / 3_600_000).toFixed(1)}h (at ${RESET_HOUR_UTC}:00 UTC).`,
  );

  // A recursive setTimeout recomputes the target each time, never drifting over a long-running process
  setTimeout(async () => {
    try {
      console.log("Running scheduled daily database reset...");
      await seedDatabase();
      console.log("Scheduled database reset complete.");
    } catch (error) {
      console.error("Scheduled database reset failed:", error);
    } finally {
      scheduleNext();
    }
  }, delay);
}

/**
 * Starts the daily reset timer that wipes the database back to the default demo data.
 * Set DISABLE_AUTO_RESET=true to opt out.
 */
export function scheduleAutoReset(): void {
  if (process.env.DISABLE_AUTO_RESET === "true") {
    console.log("Automatic database reset disabled.");
    return;
  }

  scheduleNext();
}
