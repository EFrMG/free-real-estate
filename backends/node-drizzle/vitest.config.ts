import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

// Every binding below lives in Miniflare's throwaway local storage; nothing here can reach the Cloudflare account named in wrangler.json.
export default defineConfig(async () => {
  // The same checked-in SQL files `wrangler d1 migrations apply` uses; test/setup.ts applies them to the in-memory D1 before each test
  const migrations = await readD1Migrations("./drizzle");

  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.json" },
        // Defaults to true. Off, so a future `"remote": true` binding in wrangler.json can never be proxied to the real D1/R2 from a test run
        remoteBindings: false,
        miniflare: {
          // Fixed, obviously fake values for the required Worker secrets. Tests never read `.env`, so CI needs no secrets at all
          bindings: {
            JWT_KEY: "test-only-jwt-key-not-a-secret",
            AGENT_PROMOTION_CODE: "test-only-promotion-code",
            FRONTEND_URL: "http://localhost:5173",
            DISABLE_AUTO_RESET: "true",
            TEST_MIGRATIONS: migrations,
          },
        },
      }),
    ],
    test: {
      include: ["test/**/*.test.ts"],
      setupFiles: ["./test/setup.ts"],
    },
  };
});
