import { expect, it } from "vitest";

import { DEFAULT_PASSWORD_HASH } from "../src/db/seed.ts";
import { verifyPassword } from "../src/password.ts";

// The seed hash is hardcoded, so nothing else would notice if it stopped matching the demo password
it("the precomputed seed hash verifies against the public demo password", async () => {
  expect(await verifyPassword(DEFAULT_PASSWORD_HASH, "password123")).toBe(true);
});
