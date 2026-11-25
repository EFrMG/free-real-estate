import { useRef } from "react";
import { useFetcher } from "react-router";

import type { loader } from "~/routes/chat-updates";

// Shared by the chat panel, which polls, and the header, which only reads the badge
export const CHAT_POLL_KEY = "chat-poll";

/**
 * The `chat-poll` fetcher, plus its data only while it is at least as fresh as the caller's loader data.
 *
 * Poll results are dropped as soon as any of `loaderValues` changes identity (loaders revalidated after an action, a navigation, or a chat switch), until a newer poll result arrives. Data present when the caller mounts counts as stale too. So an older poll can never hide fresher loader data.
 *
 * @param loaderValues The loader data the poll would override, compared by identity.
 */
export default function useChatPoll(...loaderValues: unknown[]) {
  const fetcher = useFetcher<typeof loader>({ key: CHAT_POLL_KEY });
  const seen = useRef({ values: loaderValues, stale: fetcher.data });

  if (
    loaderValues.length !== seen.current.values.length ||
    loaderValues.some((value, index) => value !== seen.current.values[index])
  ) {
    seen.current = { values: loaderValues, stale: fetcher.data };
  }

  const data =
    fetcher.data && fetcher.data !== seen.current.stale ? fetcher.data : null;

  return { fetcher, data };
}
