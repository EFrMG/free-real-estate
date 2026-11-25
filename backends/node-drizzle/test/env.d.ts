import type { D1Migration } from "cloudflare:test";

import type { Bindings } from "../src/env.ts";

// Types `env` from "cloudflare:workers" inside tests: the Worker's own bindings plus the migrations vitest.config.ts injects
declare global {
  namespace Cloudflare {
    interface Env extends Bindings {
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}
