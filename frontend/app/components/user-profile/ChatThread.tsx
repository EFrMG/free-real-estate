import type { ChatThreadData, MessageData } from "@free-real-estate/shared";

import { useEffect, useRef, useState } from "react";
import { Link, useFetcher } from "react-router";

import getAssetUrl, { handleProfilePictureError } from "~/utils/getAssetUrl";

import { GoPaperAirplane } from "react-icons/go";

interface ChatThreadProps {
  thread: ChatThreadData;
  currentUserId: number;
}

// Local time of a message
function MessageTime({ createdAt }: { createdAt: string }) {
  return (
    <time
      dateTime={createdAt}
      suppressHydrationWarning
      className="mt-1 block text-xs leading-none opacity-lesser"
    >
      {new Date(createdAt).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </time>
  );
}

function MessageBubble({
  message,
  isMine,
  isPending,
}: {
  message: Pick<MessageData, "text" | "createdAt">;
  isMine: boolean;
  isPending?: boolean;
}) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${isPending ? "opacity-less" : ""} ${
          isMine
            ? "rounded-br-xs bg-amber-600/94 text-amber-50"
            : "rounded-bl-xs border border-amber-200/64 bg-amber-50 text-amber-950"
        }`}
      >
        <p className="wrap-break-word whitespace-pre-wrap">{message.text}</p>
        <MessageTime createdAt={message.createdAt} />
      </div>
    </div>
  );
}

export default function ChatThread({ thread, currentUserId }: ChatThreadProps) {
  const sendFetcher = useFetcher<{ error?: string }>();
  const readFetcher = useFetcher();

  const [draft, setDraft] = useState("");
  const threadEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the thread initially mounts or changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [thread.id]);

  // Shown as a faded bubble until the round trip lands
  const pendingText = sendFetcher.formData?.get("text")?.toString();

  // Clear this conversation's unread count once it is on screen
  useEffect(() => {
    if (thread.unreadCount === 0) return;

    readFetcher.submit(
      { intent: "mark-read", chatId: String(thread.id) },
      { method: "POST" },
    );
  }, [thread.id, thread.unreadCount]);

  // Keep the newest message in view, the optimistic one included
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [thread.id, thread.messages.length, pendingText]);

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text) return;

    sendFetcher.submit(
      { intent: "send-message", chatId: String(thread.id), text },
      { method: "POST" },
    );

    setDraft("");
  }

  return (
    <div className="stack-3 h-full max-md:max-h-[52dvh]">
      {/* Who and what the conversation is about */}
      <div className="flex shrink-0 items-center gap-3">
        <img
          src={getAssetUrl(thread.otherUser.profilePicture)}
          onError={handleProfilePictureError}
          alt=""
          draggable={false}
          className="h-12 w-12 shrink-0 rounded-full object-cover shadow-sm"
        />
        <div className="min-w-0">
          <p className="line-clamp-1 font-medium text-amber-950">
            {thread.otherUser.name}
          </p>
          <Link
            to={`/properties/${thread.property.id}`}
            className="line-clamp-1 text-sm text-amber-800/74 underline decoration-amber-700/48"
          >
            {thread.property.title}
          </Link>
        </div>
      </div>

      <div className="custom-scrollbar stack-2 min-h-0 grow overflow-y-auto pr-1 md:overscroll-contain">
        {thread.messages.length || pendingText ? (
          <>
            {thread.messages.map((message) => (
              <MessageBubble
                key={`message-${message.id}`}
                message={message}
                isMine={message.senderId === currentUserId}
              />
            ))}

            {pendingText && (
              <MessageBubble
                message={{
                  text: pendingText,
                  createdAt: new Date().toISOString(),
                }}
                isMine={true}
                isPending={true}
              />
            )}
          </>
        ) : (
          <p className="my-auto py-6 text-center text-amber-800/48 italic">
            No messages yet. Say hello!
          </p>
        )}

        <div ref={threadEndRef} />
      </div>

      <sendFetcher.Form
        method="POST"
        onSubmit={handleSend}
        className="shrink-0"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            name="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={2000}
            autoComplete="off"
            placeholder="Type a message..."
            aria-label={`Message ${thread.otherUser.name}`}
            className="input-form min-w-0 grow py-2!"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            title="Send message"
            className="rounded-full bg-amber-600/94 p-2.5 text-slate-50 shadow-md transition-colors duration-150 hover:bg-amber-700/94 disabled:cursor-not-allowed disabled:opacity-74"
          >
            <GoPaperAirplane size={16} />
          </button>
        </div>
      </sendFetcher.Form>

      {sendFetcher.data?.error && (
        <p className="form-error">{sendFetcher.data.error}</p>
      )}
    </div>
  );
}
