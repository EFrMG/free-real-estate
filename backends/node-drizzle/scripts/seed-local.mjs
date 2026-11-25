/**
 * Loads the demo fixtures into the local D1 database.
 *
 *   node seed-local.mjs          starts a temporary local Worker and calls its scheduled handler
 *   node seed-local.mjs --http   calls the scheduled endpoint of an already running `pnpm dev`
 *
 * Both modes run the same production path: scheduled() -> resetDatabase() -> seedDatabase().
 */
import { unstable_startWorker } from "wrangler";

const SEED_PATH = "/cdn-cgi/local/scheduled";
const SEED_URL =
  process.env.SEED_URL ?? "http://localhost:8787/cdn-cgi/local/scheduled";
const HTTP_RETRY_TIMEOUT_MS = 30_000;
const HTTP_RETRY_INTERVAL_MS = 500;

const useHttp = process.argv.includes("--http");

/** Wait for `wrangler dev` to come up, then invoke its test-scheduled route. */
async function seedThroughDevServer() {
  const deadline = Date.now() + HTTP_RETRY_TIMEOUT_MS;
  let lastError;

  while (Date.now() < deadline) {
    let response;
    try {
      response = await fetch(SEED_URL);
    } catch (error) {
      // Connection refused while the dev server boots: keep trying.
      lastError = error;
      await new Promise((resolve) =>
        setTimeout(resolve, HTTP_RETRY_INTERVAL_MS),
      );
      continue;
    }

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Scheduled handler returned ${response.status}: ${body}`);
    }
    return;
  }

  throw new Error(
    `Could not reach ${SEED_URL} after ${HTTP_RETRY_TIMEOUT_MS / 1000}s. Is \`pnpm dev\` running? (${lastError?.message ?? "no response"})`,
  );
}

/** Start an ephemeral Worker against the same local state, run the handler, then tear it down. */
async function seedThroughWorker() {
  const dev = { testScheduled: true };
  // Same default as `wrangler dev`; overridable so the command can be exercised against a throwaway copy.
  if (process.env.SEED_PERSIST) dev.persist = process.env.SEED_PERSIST;

  const worker = await unstable_startWorker({
    config: "wrangler.json",
    dev,
  });

  try {
    await worker.ready;
    const response = await worker.fetch(`http://localhost${SEED_PATH}`);
    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Scheduled handler returned ${response.status}: ${body}`);
    }
  } finally {
    await worker.dispose();
  }
}

try {
  if (useHttp) {
    await seedThroughDevServer();
  } else {
    await seedThroughWorker();
  }
  console.log(
    `\nLocal seed complete via ${useHttp ? "the running dev server" : "a temporary Worker"}.`,
  );
} catch (error) {
  console.error(
    `\nSeed failed: ${error instanceof Error ? error.message : error}`,
  );
  process.exitCode = 1;
}
