import type {
  ChatPollData,
  ChatSummary,
  ChatThreadData,
} from "@free-real-estate/shared";
import { describe, expect, it } from "vitest";

import { chatParticipants, chats, messages } from "../src/db/schema.ts";
import {
  call,
  createProperty,
  createUser,
  db,
  sessionCookie,
} from "./helpers.ts";

const at = (day: number) =>
  `2026-02-${String(day).padStart(2, "0")}T00:00:00.000Z`;

/** A chat between `reader` and `other`, where the reader last read on `readerReadDay`. */
async function insertChat(
  propertyId: number,
  reader: number,
  other: number,
  { updatedDay, readerReadDay }: { updatedDay: number; readerReadDay: number },
) {
  const chat = await db()
    .insert(chats)
    .values({ propertyId, updatedAt: at(updatedDay) })
    .returning()
    .get();

  await db()
    .insert(chatParticipants)
    .values([
      { chatId: chat.id, userId: reader, lastReadAt: at(readerReadDay) },
      { chatId: chat.id, userId: other, lastReadAt: at(updatedDay) },
    ]);

  return chat;
}

async function insertMessage(
  chatId: number,
  senderId: number,
  day: number,
  text: string,
) {
  return db()
    .insert(messages)
    .values({ chatId, senderId, text, createdAt: at(day) })
    .returning()
    .get();
}

async function seed() {
  const agent = await createUser("agent");
  const buyer = await createUser("user");
  const property = await createProperty(agent.id);

  // The buyer read up to day 5: the agent's day-3 message is read, days 6 and 8 are not, and the buyer's own day-7 message never counts
  const busy = await insertChat(property.id, buyer.id, agent.id, {
    updatedDay: 8,
    readerReadDay: 5,
  });
  await insertMessage(busy.id, agent.id, 3, "already read");
  await insertMessage(busy.id, agent.id, 6, "unread one");
  await insertMessage(busy.id, buyer.id, 7, "my own reply");
  const newest = await insertMessage(busy.id, agent.id, 8, "unread two");

  // Opened but never written in; updated more recently, so it sorts first
  const empty = await insertChat(property.id, buyer.id, agent.id, {
    updatedDay: 9,
    readerReadDay: 1,
  });

  return { agent, buyer, property, busy, empty, newest };
}

describe("chat summaries", () => {
  it("GET /api/chats resolves lastMessage and unreadCount per chat, newest first", async () => {
    const { agent, buyer, property, busy, empty, newest } = await seed();

    const response = await call("/api/chats", {
      cookie: await sessionCookie(buyer),
    });
    expect(response.status).toBe(200);

    expect((await response.json()) as ChatSummary[]).toEqual([
      {
        id: empty.id,
        updatedAt: at(9),
        otherUser: {
          id: agent.id,
          name: agent.name,
          profilePicture: agent.profilePicture,
          role: "agent",
        },
        property: {
          id: property.id,
          title: property.title,
          exteriorImage: property.exteriorImage,
        },
        lastMessage: null,
        unreadCount: 0,
      },
      {
        id: busy.id,
        updatedAt: at(8),
        otherUser: {
          id: agent.id,
          name: agent.name,
          profilePicture: agent.profilePicture,
          role: "agent",
        },
        property: {
          id: property.id,
          title: property.title,
          exteriorImage: property.exteriorImage,
        },
        lastMessage: newest,
        // Days 6 and 8 from the agent; day 3 predates lastReadAt and day 7 is the buyer's own
        unreadCount: 2,
      },
    ]);
  });

  it("counts unread from each reader's own watermark and never their own messages", async () => {
    const { agent, busy } = await seed();

    // The agent's lastReadAt is day 8, so the buyer's day-7 reply is already read and the agent's own messages never count
    const response = await call("/api/chats", {
      cookie: await sessionCookie(agent),
    });
    const list = (await response.json()) as ChatSummary[];

    expect(list.find((chat) => chat.id === busy.id)).toMatchObject({
      unreadCount: 0,
      lastMessage: { text: "unread two" },
    });
  });

  it("a later message from the reader becomes lastMessage without adding to unreadCount", async () => {
    const { buyer, busy } = await seed();
    await insertMessage(busy.id, buyer.id, 10, "latest, mine");

    const response = await call("/api/chats", {
      cookie: await sessionCookie(buyer),
    });
    const list = (await response.json()) as ChatSummary[];

    expect(list.find((chat) => chat.id === busy.id)).toMatchObject({
      unreadCount: 2,
      lastMessage: { text: "latest, mine", senderId: buyer.id },
    });
  });

  it("GET /api/chats/:id/messages returns the same summary plus the full history, oldest first", async () => {
    const { buyer, busy, empty } = await seed();
    const cookie = await sessionCookie(buyer);

    const thread = (await (
      await call(`/api/chats/${busy.id}/messages`, { cookie })
    ).json()) as ChatThreadData;

    expect(thread).toMatchObject({
      id: busy.id,
      unreadCount: 2,
      lastMessage: { text: "unread two" },
    });
    expect(thread.messages.map((message) => message.text)).toEqual([
      "already read",
      "unread one",
      "my own reply",
      "unread two",
    ]);

    const emptyThread = (await (
      await call(`/api/chats/${empty.id}/messages`, { cookie })
    ).json()) as ChatThreadData;

    expect(emptyThread).toMatchObject({
      id: empty.id,
      lastMessage: null,
      unreadCount: 0,
      messages: [],
    });
  });
});

describe("GET /api/auth/me unreadSenders", () => {
  it("counts distinct people with unread messages, not messages, and ignores the reader's own", async () => {
    const { buyer, property } = await seed();
    // The seed leaves the buyer two unread messages from one agent; a second agent with one unread message makes it two people
    const otherAgent = await createUser("agent");
    const second = await insertChat(property.id, buyer.id, otherAgent.id, {
      updatedDay: 4,
      readerReadDay: 1,
    });
    await insertMessage(second.id, otherAgent.id, 2, "hello from another agent");
    await insertMessage(second.id, buyer.id, 3, "my own, never unread");

    const response = await call("/api/auth/me", {
      cookie: await sessionCookie(buyer),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      id: buyer.id,
      unreadSenders: 2,
    });
  });
});

describe("GET /api/chats/poll", () => {
  it("returns the chat list, the unread badge and the requested thread in one response", async () => {
    const { buyer, busy } = await seed();
    const cookie = await sessionCookie(buyer);

    const response = await call(`/api/chats/poll?chat=${busy.id}`, { cookie });
    expect(response.status).toBe(200);
    const poll = (await response.json()) as ChatPollData;

    // The list and the thread are exactly what the dedicated endpoints return
    const list = await (await call("/api/chats", { cookie })).json();
    const thread = await (
      await call(`/api/chats/${busy.id}/messages`, { cookie })
    ).json();

    expect(poll).toEqual({ chats: list, unreadSenders: 1, thread });
  });

  it("has no thread when none is asked for or the user takes no part in it", async () => {
    const { busy } = await seed();
    const outsider = await createUser("user");
    const cookie = await sessionCookie(outsider);

    const asOutsider = (await (
      await call(`/api/chats/poll?chat=${busy.id}`, { cookie })
    ).json()) as ChatPollData;
    const withoutChat = (await (
      await call("/api/chats/poll", { cookie })
    ).json()) as ChatPollData;

    expect(asOutsider).toEqual({ chats: [], unreadSenders: 0, thread: null });
    expect(withoutChat).toEqual({ chats: [], unreadSenders: 0, thread: null });
    expect(JSON.stringify(asOutsider)).not.toContain("unread one");
  });
});
