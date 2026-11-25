import { applyD1Migrations, reset } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { afterEach, beforeEach, vi } from "vitest";

// Each test starts from an empty, freshly migrated D1 and an empty R2 bucket, so fixtures never leak between tests or files
beforeEach(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
});

afterEach(async () => {
  vi.useRealTimers();
  await reset();
});
