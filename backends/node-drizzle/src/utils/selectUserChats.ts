import { eq, ne, and, asc, desc, gt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

import type { Database } from "../db/index.ts";
import {
  users,
  properties,
  chats,
  chatParticipants,
  messages,
} from "../db/schema.ts";

// Two references to the same join table: the reader's row and the counterpart's
const myPart = alias(chatParticipants, "my_participation");
const otherPart = alias(chatParticipants, "other_participation");

// The conversation, its counterpart and its property, shared by both builders below
const chatFields = {
  id: chats.id,
  updatedAt: chats.updatedAt,
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
};

/**
 * Builds the query for the conversations a user takes part in, joined with the counterpart participant and the property the conversation is about.
 *
 * Chats always hold exactly two participants, so the counterpart is flattened into the same row. The returned builder is unfiltered beyond the reader's own participation; callers can still chain `.where()` and `.orderBy()`; a chained `.where()` on `users.id` narrows by counterpart.
 *
 * @param userId The reader, whose own participation row carries `lastReadAt`.
 * @returns A Drizzle query builder yielding one row per conversation.
 */
export default function selectUserChats(db: Database, userId: number) {
  return db
    .select({ ...chatFields, lastReadAt: myPart.lastReadAt })
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

/**
 * Builds the query for a user's conversations in the `ChatSummary` shape: each row carries the chat's newest message and how many of the counterpart's messages arrived after the reader's `lastReadAt`.
 *
 * Both are computed in SQL from one pass over the reader's messages. `messages.chat_id` has no index, so a window function over a single join (resolved through the `chat_participants` primary key) is used instead of correlated subqueries, which would rescan `messages` once per chat. Ties on `createdAt` go to the higher message id.
 *
 * Like `selectUserChats`, callers chain `.where()` (e.g. on `chats.id`) and `.orderBy()`.
 *
 * @param userId The reader, whose own messages never count as unread.
 * @returns A Drizzle query builder yielding one `ChatSummary` per conversation.
 */
export function selectChatSummaries(db: Database, userId: number) {
  const activity = db
    .select({
      id: messages.id,
      chatId: messages.chatId,
      senderId: messages.senderId,
      text: messages.text,
      createdAt: messages.createdAt,
      rank: sql<number>`row_number() over (partition by ${messages.chatId} order by ${messages.createdAt} desc, ${messages.id} desc)`.as(
        "rank",
      ),
      // ISO 8601 sorts lexicographically, so a string compare is chronological
      unreadCount: sql<number>`count(*) filter (where ${and(
        ne(messages.senderId, userId),
        gt(messages.createdAt, chatParticipants.lastReadAt),
      )}) over (partition by ${messages.chatId})`.as("unread_count"),
    })
    .from(messages)
    .innerJoin(
      chatParticipants,
      and(
        eq(chatParticipants.chatId, messages.chatId),
        eq(chatParticipants.userId, userId),
      ),
    )
    .as("chat_activity");

  return db
    .select({
      ...chatFields,
      // Left-joined, so a chat without messages gets `null` here
      lastMessage: {
        id: activity.id,
        chatId: activity.chatId,
        senderId: activity.senderId,
        text: activity.text,
        createdAt: activity.createdAt,
      },
      unreadCount: sql<number>`coalesce(${activity.unreadCount}, 0)`.mapWith(
        Number,
      ),
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
    .innerJoin(properties, eq(properties.id, chats.propertyId))
    .leftJoin(
      activity,
      and(eq(activity.chatId, chats.id), eq(activity.rank, 1)),
    );
}

/** Every conversation of the user as `ChatSummary`, most recently updated first. */
export function listChatSummaries(db: Database, userId: number) {
  return selectChatSummaries(db, userId).orderBy(desc(chats.updatedAt));
}

/** A chat's full history, oldest first (ties by id, matching how `lastMessage` breaks them). The caller is responsible for checking participation. */
export function selectChatMessages(db: Database, chatId: number) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt), asc(messages.id));
}
