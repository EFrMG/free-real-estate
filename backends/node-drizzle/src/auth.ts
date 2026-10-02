import type { Context } from "hono";

import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { eq } from "drizzle-orm";

import { refreshTokens, users } from "./db/schema.ts";
import type { AppEnv, UserSession } from "./env.ts";

const SESSION_COOKIE = "session";
const REFRESH_COOKIE = "refresh";
const JWT_EXPIRY_SECONDS = 60 * 60; // 1 hour
const REFRESH_EXPIRY_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type { UserSession } from "./env.ts";

// Token utilities --.

/** Cryptographically random opaque token (64 hex characters). */
function createOpaqueToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** SHA-256 hash of an opaque token (64 hex characters out). */
async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

// Cookie utilities --.

/** Issue a short-lived JWT and set it as the `session` httpOnly cookie. */
export async function setSessionCookie(
  c: Context<AppEnv>,
  user: UserSession,
) {
  const token = await sign(
    { ...user, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS },
    c.env.JWT_KEY,
  );

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: JWT_EXPIRY_SECONDS,
    secure: new URL(c.req.url).protocol === "https:",
  });
}

/**
 * Create a refresh token, store its hash in the database, and set it as
 * the `refresh` httpOnly cookie. A new rotation family is created too.
 */
export async function createRefreshToken(
  c: Context<AppEnv>,
  userId: number,
): Promise<void> {
  const db = c.var.db;
  const token = createOpaqueToken();
  const tokenHash = await hashToken(token);
  const family = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_EXPIRY_SECONDS * 1000);

  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    family,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  });

  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/api",
    maxAge: REFRESH_EXPIRY_SECONDS,
    secure: new URL(c.req.url).protocol === "https:",
  });
}

/**
 * Delete the old refresh token and issue a new one in the
 * same family. Returns the new opaque token (already set as a cookie).
 */
async function rotateRefreshToken(
  c: Context<AppEnv>,
  oldTokenHash: string,
  family: string,
  userId: number,
): Promise<void> {
  const db = c.var.db;
  // Remove the consumed token
  await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.tokenHash, oldTokenHash));

  // Issue a replacement
  const token = createOpaqueToken();
  const tokenHash = await hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_EXPIRY_SECONDS * 1000);

  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    family,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  });

  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/api",
    maxAge: REFRESH_EXPIRY_SECONDS,
    secure: new URL(c.req.url).protocol === "https:",
  });
}

// Session management --.

/** Revoke every refresh token for a user (logout everywhere / password change). */
export async function revokeAllUserSessions(
  c: Context<AppEnv>,
  userId: number,
): Promise<void> {
  await c.var.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}

/** Clear both auth cookies from the response. */
export function clearAuthCookies(c: Context<AppEnv>): void {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  deleteCookie(c, REFRESH_COOKIE, { path: "/api" });
}

// Middleware --.

/**
 * Verify the JWT and attach UserSession to context.
 *
 * If the JWT is expired but a valid refresh token is present, the middleware
 * transparently rotates the refresh token, issues a new JWT, and continues
 * the request.
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const db = c.var.db;
  const sessionToken = getCookie(c, SESSION_COOKIE);

  // Try the JWT first
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, c.env.JWT_KEY, "HS256");
      const user: UserSession = {
        id: payload["id"] as number,
        role: payload["role"] as "agent" | "user",
      };

      c.set("user", user);

      return await next();
    } catch {
      // JWT is invalid or expired: fall through and refresh
    }
  }

  // Attempt a silent refresh
  const refreshCookie = getCookie(c, REFRESH_COOKIE);

  if (!refreshCookie) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const refreshTokenHash = await hashToken(refreshCookie);

  const storedRefreshToken = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, refreshTokenHash))
    .get();

  if (!storedRefreshToken) {
    // Refresh token not found; either already rotated (possible theft) or simply invalid
    clearAuthCookies(c);

    return c.json({ error: "Invalid refresh token." }, 401);
  }

  // Check expiry
  if (new Date(storedRefreshToken.expiresAt) < new Date()) {
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, refreshTokenHash));

    clearAuthCookies(c);

    return c.json({ error: "Refresh token expired." }, 401);
  }

  // Look up the user's current role (it may have changed since the token was issued)
  const user = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, storedRefreshToken.userId))
    .get();

  if (!user) {
    // User was deleted: remove the whole family
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.family, storedRefreshToken.family));

    clearAuthCookies(c);

    return c.json({ error: "User not found." }, 401);
  }

  // Rotate the refresh token and issue a new JWT then
  await rotateRefreshToken(
    c,
    refreshTokenHash,
    storedRefreshToken.family,
    storedRefreshToken.userId,
  );

  const session: UserSession = {
    id: user.id,
    role: user.role as "agent" | "user",
  };
  await setSessionCookie(c, session);

  c.set("user", session);
  return await next();
});

/**
 * Restrict a route to agent accounts.
 *
 * Chained after `requireAuth`, which is what puts the session on the context; on its own, this middleware has nothing to read.
 */
export const requireAgent = createMiddleware<AppEnv>(async (c, next) => {
  const session = c.get("user");

  if (session?.role !== "agent") {
    return c.json({ error: "Only agent accounts can manage listings." }, 403);
  }

  return await next();
});

export { deleteCookie, SESSION_COOKIE as COOKIE_NAME, REFRESH_COOKIE };
