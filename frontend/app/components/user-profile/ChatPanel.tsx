import type { ChatSummary, ChatThreadData } from "@free-real-estate/shared";

import { Link, useSearchParams } from "react-router";

import usePollingRevalidation from "~/hooks/usePollingRevalidation";

import ChatList from "./ChatList";
import ChatThread from "./ChatThread";

import { GoComment } from "react-icons/go";

// Cheap enough for a handful of REST calls, short enough to feel conversational
const POLLING_INTERVAL_MS = 8000;

interface ChatPanelProps {
  chats: ChatSummary[];
  thread: ChatThreadData | null;
  currentUserId: number;
}

export default function ChatPanel({
  chats,
  thread,
  currentUserId,
}: ChatPanelProps) {
  usePollingRevalidation(POLLING_INTERVAL_MS);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedChatId = Number(searchParams.get("chat")) || null;

  function selectChat(chatId: number) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);

        // Clicking the open conversation again closes it
        if (next.get("chat") === String(chatId)) next.delete("chat");
        else next.set("chat", String(chatId));

        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }

  if (!chats.length) {
    return (
      <div className="md:sticky md:top-[7.5vh] md:h-full md:max-h-[30dvh] flex flex-col chat-card">
        <h2 className="text-lg font-semibold text-amber-950 mb-4 flex items-center gap-2">
          <span className="text-amber-700">
            <GoComment size={24} />
          </span>
          Messages
        </h2>

        <div className="stack-4 my-auto py-6 text-center">
          <div className="mx-auto p-1 rounded-full bg-amber-200/48 flex items-center justify-center">
            <span className="text-2xl opacity-40 select-none">💬</span>
          </div>
          <p className="text-amber-800/74 italic">
            Your chats will appear here.
          </p>
          <p className="text-sm text-amber-700/94">
            Visit{" "}
            <Link
              to="/our-agents"
              className="underline decoration-amber-700/74"
            >
              Our Agents
            </Link>{" "}
            or any property listing to message an agent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:sticky md:top-[7.5vh] md:h-full md:max-h-[88dvh] flex flex-col gap-4">
      <div className="shrink-0 chat-card">
        <h2 className="text-lg font-semibold text-amber-950 mb-4 flex items-center gap-2">
          <span className="text-amber-700">
            <GoComment size={24} />
          </span>
          Messages
        </h2>

        <ChatList
          chats={chats}
          selectedChatId={selectedChatId}
          onSelect={selectChat}
        />
      </div>

      <div className={`md:min-h-0 flex flex-col chat-card ${thread && "grow"}`}>
        {thread ? (
          <ChatThread thread={thread} currentUserId={currentUserId} />
        ) : (
          <p className="m-auto text-center text-amber-800/74 italic">
            Pick a conversation to read and continue it.
          </p>
        )}
      </div>
    </div>
  );
}
