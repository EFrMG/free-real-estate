import type { ChatSummary, MessageData } from "@free-real-estate/shared";
import type { UserChatRow } from "./selectUserChats.ts";

/**
 * Folds a chat row and its messages into the summary shape the frontend consumes, trading the reader's `lastReadAt` watermark for a plain unread count.
 *
 * @param row A conversation row as returned by `selectUserChats`.
 * @param chatMessages That conversation's messages, oldest first.
 * @param userId The reader, whose own messages never count as unread.
 * @returns The conversation with its last message and unread count resolved.
 */
export default function toChatSummary(
  { lastReadAt, ...chat }: UserChatRow,
  chatMessages: MessageData[],
  userId: number,
): ChatSummary {
  return {
    ...chat,
    lastMessage: chatMessages.at(-1) ?? null,
    unreadCount: chatMessages.filter(
      (message) =>
        // ISO 8601 sorts lexicographically, so a string compare is chronological
        message.senderId !== userId && message.createdAt > lastReadAt,
    ).length,
  };
}
