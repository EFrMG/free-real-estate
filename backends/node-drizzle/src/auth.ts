import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";

const JWT_KEY = process.env.JWT_KEY ?? "dev-secret--change-in-prod";
const COOKIE_NAME = "session";

export interface UserSession {
  id: number;
  email: string;
  name: string;
  role: "agent" | "user";
}

// Signs a JWT and sets it as an HttpOnly cookie
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

export const requireAuth = createMiddleware<{
  Variables: { user: UserSession };
}>(async (c, next) => {
  const token = getCookie(c, COOKIE_NAME);

  if (!token) return c.json({ error: "Unauthorized" }, 401);

  try {
    const payload = await verify(token, JWT_KEY, "HS256");

    const user: UserSession = {
      id: payload["id"] as number,
      email: payload["email"] as string,
      name: payload["name"] as string,
      role: payload["role"] as "agent" | "user",
    };

    // Pass the user
    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Invalid session token." }, 401);
  }
});

export const requireAgent = createMiddleware<{
  Variables: { user: UserSession };
}>(async (c, next) => {
  const user = c.get("user");

  if (user.role !== "agent") return c.json({ error: "Forbidden" }, 403);
  await next();
});

export { deleteCookie, COOKIE_NAME };
