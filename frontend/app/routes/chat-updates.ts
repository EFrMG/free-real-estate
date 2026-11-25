import type { Route } from "./+types/chat-updates";
import type { ChatPollData } from "@free-real-estate/shared";

import { data } from "react-router";

import forwardCookies from "~/utils/forwardCookies";
import { hasAuthCookie } from "~/utils/auth";
import { API_URL } from "~/utils/apiUrl";

export interface ChatUpdates extends ChatPollData {
  // The chat this poll asked for, so the panel only shows a thread that matches its current selection
  chatId: number | null;
}

/**
 * One chat poll tick: exactly one backend request, to /api/chats/poll.
 *
 * A silent token refresh can happen here, so the backend's Set-Cookie headers are forwarded. A failed poll forwards nothing (its cookie-clearing headers could undo a rotation made by a concurrent page request) and resolves to `null` rather than throwing, so a hiccup never reaches the page's error boundary; the panel then falls back to its loader data.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const cookie = request.headers.get("Cookie") ?? "";
  const chatId = Number(new URL(request.url).searchParams.get("chat")) || null;

  if (!hasAuthCookie(cookie)) return data(null);

  try {
    const response = await fetch(
      `${API_URL}/api/chats/poll${chatId ? `?chat=${chatId}` : ""}`,
      { headers: { Cookie: cookie } },
    );

    if (!response.ok) return data(null);

    const poll: ChatPollData = await response.json();

    return data({ ...poll, chatId } satisfies ChatUpdates, {
      headers: forwardCookies(response),
    });
  } catch (error) {
    console.error(error);
    return data(null);
  }
}
