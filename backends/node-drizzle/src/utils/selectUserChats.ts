import { eq, ne, and } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

import { db } from "../db/index.ts";
import { users, properties, chats, chatParticipants } from "../db/schema.ts";

// Two references to the same join table: the reader's row and the counterpart's
const myPart = alias(chatParticipants, "my_participation");
const otherPart = alias(chatParticipants, "other_participation");

/**
 * Builds the query for the conversations a user takes part in, joined with the counterpart participant and the property the conversation is about.
 *
 * Chats always hold exactly two participants, so the counterpart is flattened into the same row. The returned builder is unfiltered beyond the reader's own participation; callers can still chain `.where()` and `.orderBy()`; a chained `.where()` on `users.id` narrows by counterpart.
 *
 * @param userId The reader, whose own participation row carries `lastReadAt`.
 * @returns A Drizzle query builder yielding one row per conversation.
 */
export default function selectUserChats(userId: number) {
  return db
    .select({
      id: chats.id,
      updatedAt: chats.updatedAt,
      lastReadAt: myPart.lastReadAt,
      otherUser: {
        id: users.id,
        name: users.name,
        profilePicture: users.profilePicture,
        role: users.role,
      },
      property: {
        id: properties.id,
        title: properties.title,
        exteriorImage: properties.exteriorImage,
      },
    })
    .from(chats)
    .innerJoin(
      myPart,
      and(eq(myPart.chatId, chats.id), eq(myPart.userId, userId)),
    )
    .innerJoin(
      otherPart,
      and(eq(otherPart.chatId, chats.id), ne(otherPart.userId, userId)),
    )
    .innerJoin(users, eq(users.id, otherPart.userId))
    .innerJoin(properties, eq(properties.id, chats.propertyId));
}

export type UserChatRow = Awaited<ReturnType<typeof selectUserChats>>[number];
