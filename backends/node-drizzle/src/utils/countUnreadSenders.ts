import { and, countDistinct, eq, gt, ne } from "drizzle-orm";

import type { Database } from "../db/index.ts";
import { chatParticipants, messages } from "../db/schema.ts";

/**
 * Counts the distinct people with messages the user hasn't read yet, i.e. sent by someone else after the user's `lastReadAt` in that chat. This is the header badge: people waiting on a reply, not individual messages.
 *
 * @param userId The reader.
 * @returns The number of distinct unread senders, computed in SQL.
 */
export default async function countUnreadSenders(
  db: Database,
  userId: number,
): Promise<number> {
  const row = await db
    .select({ count: countDistinct(messages.senderId) })
    .from(messages)
    .innerJoin(
      chatParticipants,
      and(
        eq(chatParticipants.chatId, messages.chatId),
        eq(chatParticipants.userId, userId),
      ),
    )
    .where(
      and(
        ne(messages.senderId, userId),
        // ISO 8601 sorts lexicographically, so a string compare is chronological
        gt(messages.createdAt, chatParticipants.lastReadAt),
      ),
    )
    .get();

  return row?.count ?? 0;
}
