import type { Context } from "hono";

import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "./db/index.ts";
import { refreshTokens, users } from "./db/schema.ts";

const JWT_KEY = process.env.JWT_KEY ?? "dev-secret--change-in-prod";
const SESSION_COOKIE = "session";
const REFRESH_COOKIE = "refresh";
const JWT_EXPIRY_SECONDS = 60 * 60; // 1 hour
const REFRESH_EXPIRY_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Minimal session payload
export interface UserSession {
  id: number;
  role: "agent" | "user";
}

// Token utilities --.

/** Cryptographically random opaque token (64 hex characters). */
function createOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

/** SHA-256 hash of an opaque token (64 hex characters out). */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Cookie utilities --.

/** Issue a short-lived JWT and set it as the `session` httpOnly cookie. */
export async function setSessionCookie(c: Context, user: UserSession) {
  const token = await sign(
    { ...user, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS },
    JWT_KEY,
  );

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: JWT_EXPIRY_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Create a refresh token, store its hash in the database, and set it as
 * the `refresh` httpOnly cookie. A new rotation family is created too.
 */
export async function createRefreshToken(
  c: Context,
  userId: number,
): Promise<void> {
  const token = createOpaqueToken();
  const tokenHash = hashToken(token);
  const family = randomUUID();
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
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Delete the old refresh token and issue a new one in the
 * same family. Returns the new opaque token (already set as a cookie).
 */
async function rotateRefreshToken(
  c: Context,
  oldTokenHash: string,
  family: string,
  userId: number,
): Promise<void> {
  // Remove the consumed token
  await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.tokenHash, oldTokenHash));

  // Issue a replacement
  const token = createOpaqueToken();
  const tokenHash = hashToken(token);
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
    secure: process.env.NODE_ENV === "production",
  });
}

// Session management --.

/** Revoke every refresh token for a user (logout everywhere / password change). */
export async function revokeAllUserSessions(userId: number): Promise<void> {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}

/** Clear both auth cookies from the response. */
export function clearAuthCookies(c: Context): void {
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
export const requireAuth = createMiddleware<{
  Variables: { user: UserSession };
}>(async (c, next) => {
  const sessionToken = getCookie(c, SESSION_COOKIE);

  // Try the JWT first
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, JWT_KEY, "HS256");
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

  const refreshTokenHash = hashToken(refreshCookie);

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

export { deleteCookie, SESSION_COOKIE as COOKIE_NAME, REFRESH_COOKIE };
