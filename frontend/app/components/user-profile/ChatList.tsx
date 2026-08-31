import type { ChatSummary } from "@free-real-estate/shared";

import getAssetUrl from "~/utils/getAssetUrl";

interface ChatListProps {
  chats: ChatSummary[];
  selectedChatId: number | null;
  onSelect: (chatId: number) => void;
}

export default function ChatList({
  chats,
  selectedChatId,
  onSelect,
}: ChatListProps) {
  return (
    <ul className="max-h-[24dvh] overflow-y-auto stack-2 pr-1 md:overscroll-contain custom-scrollbar">
      {chats.map((chat) => {
        const isSelected = chat.id === selectedChatId;

        return (
          <li key={`chat-${chat.id}`}>
            <button
              type="button"
              onClick={() => onSelect(chat.id)}
              aria-current={isSelected}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left
              rounded-lg border transition-colors duration-150
              ${
                isSelected
                  ? "bg-amber-200/60 border-amber-300/74"
                  : "bg-amber-50/64 border-amber-200/40 hover:bg-amber-100/64"
              }`}
            >
              <img
                src={getAssetUrl(chat.otherUser.profilePicture)}
                alt=""
                draggable={false}
                className="w-10 h-10 shrink-0 rounded-full object-cover shadow-sm"
              />

              <div className="min-w-0 grow">
                <p className="text-sm font-medium text-amber-950 line-clamp-1">
                  {chat.otherUser.name}
                </p>
                <p className="ml-1 text-sm text-amber-800/74 line-clamp-1">
                  {chat.property.title}
                </p>
                <p className="ml-2 text-xs text-amber-900/64 italic line-clamp-2">
                  {chat.lastMessage?.text ?? "No messages yet."}
                </p>
              </div>

              {chat.unreadCount > 0 && (
                <span
                  title={`${chat.unreadCount} unread`}
                  className="shrink-0 px-1.5 py-1 bg-rose-700 rounded-full
                  text-xs text-yellow-50 leading-none font-bold"
                >
                  {chat.unreadCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
