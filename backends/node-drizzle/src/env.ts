import type { Database } from "./db/index.ts";

export interface UserSession {
  id: number;
  role: "agent" | "user";
}

export interface Bindings {
  DB: D1Database;
  UPLOADS: R2Bucket;
  JWT_KEY: string;
  AGENT_PROMOTION_CODE: string;
  FRONTEND_URL: string;
  DISABLE_AUTO_RESET?: string;
}

export interface AppEnv {
  Bindings: Bindings;
  Variables: {
    db: Database;
    user: UserSession;
  };
}
