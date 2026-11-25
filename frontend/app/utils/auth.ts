import {
  createContext,
  type MiddlewareFunction,
  type RouterContextProvider,
} from "react-router";
import type { CurrentUser } from "@free-real-estate/shared";

import { API_URL } from "~/utils/apiUrl";

export interface Auth {
  // The signed-in user from /api/auth/me, or null for anonymous visitors and failed checks
  user: CurrentUser | null;
  // The Cookie header to send to the backend from here on: the incoming one, with any session/refresh cookie /auth/me just rotated swapped in, so later calls never try to rotate the same refresh token again
  cookie: string;
}

const authContext = createContext<() => Promise<Auth>>();

/** True when the Cookie header carries a `session` or `refresh` cookie, the only ones /auth/me can authenticate with. */
export function hasAuthCookie(cookieHeader: string) {
  return /(?:^|;\s*)(?:session|refresh)=/.test(cookieHeader);
}

/** The incoming Cookie header with every cookie a response sets replacing the one of the same name. */
function applySetCookies(cookieHeader: string, response: Response) {
  const cookies = new Map<string, string>();

  for (const pair of cookieHeader.split(";")) {
    const index = pair.indexOf("=");
    if (index > 0)
      cookies.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }

  for (const header of response.headers.getSetCookie()) {
    const [pair] = header.split(";");
    const index = pair.indexOf("=");
    if (index > 0)
      cookies.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }

  return Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; ");
}

/**
 * Root middleware that lets every loader and action of one request share a single /api/auth/me call.
 *
 * The call is lazy: it only happens when something awaits `getAuth`, so navigations and resource routes that never need the user cost no backend invocation, and it is skipped outright when the request carries no auth cookie.
 *
 * Root and route loaders run in parallel, so before this each of them called /auth/me on its own; with an expired JWT those parallel calls raced to rotate the same refresh token. Now a rotation happens at most once, and its Set-Cookie headers are appended here, once, to whatever response the request ends with. A failed call forwards nothing, so its cookie-clearing headers can never undo a rotation.
 */
export const authMiddleware: MiddlewareFunction<Response> = async (
  { request, context },
  next,
) => {
  const incoming = request.headers.get("Cookie") ?? "";
  let rotatedBy: Response | null = null;
  let pending: Promise<Auth> | null = null;

  async function load(): Promise<Auth> {
    const anonymous = { user: null, cookie: incoming };

    if (!hasAuthCookie(incoming)) return anonymous;

    try {
      const response = await fetch(API_URL + "/api/auth/me", {
        headers: { Cookie: incoming },
      });

      if (!response.ok) return anonymous;

      const user: CurrentUser = await response.json();
      rotatedBy = response;

      return { user, cookie: applySetCookies(incoming, response) };
    } catch (error) {
      console.error(error); // The backend should handle this on requireAuth regardless
      return anonymous;
    }
  }

  context.set(authContext, () => (pending ??= load()));

  const response = await next();

  const setCookies = (rotatedBy as Response | null)?.headers.getSetCookie();
  if (!setCookies?.length) return response;

  // Responses passed straight through from fetch have immutable headers
  const forwarded = new Response(response.body, response);
  for (const cookie of setCookies)
    forwarded.headers.append("Set-Cookie", cookie);

  return forwarded;
};

/** The request's signed-in user and the Cookie header to forward to the backend, fetched at most once per request. */
export function getAuth(context: Readonly<RouterContextProvider>) {
  return context.get(authContext)();
}
