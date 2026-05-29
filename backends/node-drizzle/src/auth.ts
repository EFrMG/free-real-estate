// Authentication utilities for Free Real Estate backend

import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";

const JWT_KEY = process.env.JWT_KEY ?? "dev-secret--change-in-prod";
const COOKIE_NAME = "session";

// Minimal session payload
export interface UserSession {
  id: number;
  role: "agent" | "user";
}

export async function setSessionCookie(c: any, user: UserSession) {
  const token = await sign(
    { ...user, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, // 7 days
    JWT_KEY,
  );

  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
}

// Middleware to verify the JWT and attach UserSession to context
export const requireAuth = createMiddleware<{
  Variables: { user: UserSession };
}>(async (c, next) => {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) return c.json({ error: "Unauthorized as user" }, 401);

  try {
    const payload = await verify(token, JWT_KEY, "HS256");
    const user: UserSession = {
      id: payload["id"] as number,
      role: payload["role"] as "agent" | "user",
    };
    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Invalid session token." }, 401);
  }
});

export { deleteCookie, COOKIE_NAME };
