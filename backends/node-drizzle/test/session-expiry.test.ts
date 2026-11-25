import { eq } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";

import { refreshTokens } from "../src/db/schema.ts";
import { hashPassword } from "../src/password.ts";
import {
  call,
  createRefresh,
  createUser,
  db,
  setCookies,
  sessionCookie,
  sha256Hex,
} from "./helpers.ts";

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
// A whole second, so JWT `exp` (seconds) and Date.now() (milliseconds) line up exactly
const T0 = Date.UTC(2026, 0, 15, 12, 0, 0);

/** Pin the clock the Worker reads (`Date`), leaving real timers alone so D1/R2 I/O keeps working. */
function at(ms: number) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(ms);
}

describe("session JWT expiry boundary", () => {
  it("a logged-in session is accepted until the last millisecond of its hour and rejected at the hour", async () => {
    const user = await createUser("user", await hashPassword("correct horse"));

    at(T0);
    const login = await call("/api/auth/login", {
      method: "POST",
      json: { email: user.email, password: "correct horse" },
    });
    expect(login.status).toBe(200);
    const session = `session=${setCookies(login)["session"]}`;
    expect(
      login.headers.getSetCookie().find((h) => h.startsWith("session=")),
    ).toMatch(/Max-Age=3600/);

    at(T0 + HOUR - 1);
    const stillValid = await call("/api/auth/me", { cookie: session });
    expect(stillValid.status).toBe(200);
    // Accepted on the JWT alone: no refresh happened, so nothing was re-issued
    expect(setCookies(stillValid)).toEqual({});

    at(T0 + HOUR);
    const expired = await call("/api/auth/me", { cookie: session });
    expect(expired.status).toBe(401);
  });

  it("an expired JWT with a live refresh token rotates both, and the consumed refresh token is then rejected", async () => {
    const user = await createUser("user");
    at(T0);
    const refresh = await createRefresh(user.id, new Date(T0 + 30 * DAY));
    const expiredSession = await sessionCookie(user, T0 / 1000);

    const refreshed = await call("/api/auth/me", {
      cookie: `${expiredSession}; refresh=${refresh}`,
    });
    expect(refreshed.status).toBe(200);
    const issued = setCookies(refreshed);
    expect(Object.keys(issued).sort()).toEqual(["refresh", "session"]);
    expect(issued["refresh"]).not.toBe(refresh);

    // Exactly one row remains, and it belongs to the newly issued token
    const rows = await db()
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, user.id));
    expect(rows.map((row) => row.tokenHash)).toEqual([
      await sha256Hex(issued["refresh"]),
    ]);

    // The new session cookie works on its own
    expect(
      (await call("/api/auth/me", { cookie: `session=${issued["session"]}` }))
        .status,
    ).toBe(200);

    // Replaying the consumed refresh token fails and asks the browser to drop both cookies
    const replay = await call("/api/auth/me", {
      cookie: `${expiredSession}; refresh=${refresh}`,
    });
    expect(replay.status).toBe(401);
    expect(
      replay.headers.getSetCookie().every((h) => /Max-Age=0/i.test(h)),
    ).toBe(true);
  });

  it("a refresh token is still honoured at its exact expiresAt and rejected one millisecond later", async () => {
    const user = await createUser("user");
    const expiresAt = T0 + 30 * DAY;
    at(T0);
    const atBoundary = await createRefresh(user.id, new Date(expiresAt));
    const pastBoundary = await createRefresh(user.id, new Date(expiresAt));
    const expiredSession = await sessionCookie(user, T0 / 1000);

    // The comparison is `expiresAt < now`, so the boundary instant itself is inclusive
    at(expiresAt);
    expect(
      (
        await call("/api/auth/me", {
          cookie: `${expiredSession}; refresh=${atBoundary}`,
        })
      ).status,
    ).toBe(200);

    at(expiresAt + 1);
    const expired = await call("/api/auth/me", {
      cookie: `${expiredSession}; refresh=${pastBoundary}`,
    });
    expect(expired.status).toBe(401);
    expect(await expired.json()).toEqual({ error: "Refresh token expired." });
    // The expired row is deleted rather than left behind
    const remaining = await db()
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, await sha256Hex(pastBoundary)));
    expect(remaining).toHaveLength(0);
  });
});
