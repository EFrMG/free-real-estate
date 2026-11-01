import type { ChatSummary } from "@free-real-estate/shared";

import getAssetUrl, { handleProfilePictureError } from "~/utils/getAssetUrl";

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
    <ul className="custom-scrollbar stack-2 overflow-y-auto pr-1 md:max-h-[24dvh] md:overscroll-contain">
      {chats.map((chat) => {
        const isSelected = chat.id === selectedChatId;

        return (
          <li key={`chat-${chat.id}`}>
            <button
              type="button"
              onClick={() => onSelect(chat.id)}
              aria-current={isSelected}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors duration-150 ${
                isSelected
                  ? "border-amber-300/74 bg-amber-200/60"
                  : "border-amber-200/40 bg-amber-50/64 hover:bg-amber-100/64"
              }`}
            >
              <img
                src={getAssetUrl(chat.otherUser.profilePicture)}
                onError={handleProfilePictureError}
                alt=""
                draggable={false}
                className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm"
              />

              <div className="min-w-0 grow">
                <p className="line-clamp-1 text-sm font-medium text-amber-950">
                  {chat.otherUser.name}
                </p>
                <p className="ml-1 line-clamp-1 text-sm text-amber-800/74">
                  {chat.property.title}
                </p>
                <p className="ml-2 line-clamp-2 text-xs text-amber-900/64 italic">
                  {chat.lastMessage?.text ?? "No messages yet."}
                </p>
              </div>

              {chat.unreadCount > 0 && (
                <span
                  title={`${chat.unreadCount} unread`}
                  className="shrink-0 rounded-full bg-rose-700 px-1.5 py-1 text-xs leading-none font-bold text-yellow-50"
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
