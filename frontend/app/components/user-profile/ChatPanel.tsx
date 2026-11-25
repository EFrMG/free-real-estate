import type { ChatSummary, ChatThreadData } from "@free-real-estate/shared";

import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";

import useChatPoll from "~/hooks/useChatPoll";

import ChatList from "./ChatList";
import ChatThread from "./ChatThread";

import { GoComment } from "react-icons/go";

// Short enough to feel conversational; each tick is one frontend and one backend request
const POLLING_INTERVAL_MS = 8000;

interface ChatPanelProps {
  chats: ChatSummary[];
  thread: ChatThreadData | null;
  currentUserId: number;
}

export default function ChatPanel({
  chats: loaderChats,
  thread: loaderThread,
  currentUserId,
}: ChatPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedChatId = Number(searchParams.get("chat")) || null;

  // Poll results win only while newer than the loader data, and the thread only when it is the selected chat's, so switching chats never flashes the previous thread
  const { fetcher, data: poll } = useChatPoll(loaderChats, loaderThread);
  const chats = poll?.chats ?? loaderChats;
  const thread =
    poll && poll.chatId === selectedChatId ? poll.thread : loaderThread;

  // Refs so the interval reads the latest fetcher and selection without being rebuilt each render
  const fetcherRef = useRef(fetcher);
  const selectedChatRef = useRef(selectedChatId);
  fetcherRef.current = fetcher;
  selectedChatRef.current = selectedChatId;

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (fetcherRef.current.state !== "idle") return;

      const chatId = selectedChatRef.current;
      fetcherRef.current.load(
        `/chat-updates${chatId ? `?chat=${chatId}` : ""}`,
      );
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

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
      <div className="chat-card flex flex-col md:sticky md:top-[7.5vh] md:h-full md:max-h-[30dvh]">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-950">
          <span className="text-amber-700">
            <GoComment size={24} />
          </span>
          Messages
        </h2>

        <div className="my-auto stack-4 py-6 text-center">
          <div className="mx-auto flex items-center justify-center rounded-full bg-amber-200/48 p-1">
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
    <div className="flex flex-col gap-4 md:sticky md:top-[7.5vh] md:h-full md:max-h-[88dvh]">
      <div className="chat-card shrink-0">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-950">
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

      <div className={`chat-card flex flex-col md:min-h-0 ${thread && "grow"}`}>
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
