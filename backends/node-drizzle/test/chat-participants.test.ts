import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { chatParticipants, chats, messages } from "../src/db/schema.ts";
import {
  call,
  createChat,
  createProperty,
  createUser,
  db,
  sessionCookie,
} from "./helpers.ts";

/** An agent's listing with a chat between a buyer and that agent, plus a third account that takes no part in it. */
async function seed() {
  const agent = await createUser("agent");
  const buyer = await createUser("user");
  const outsider = await createUser("user");
  const property = await createProperty(agent.id);
  const chat = await createChat(property.id, buyer.id, agent.id);

  return { agent, buyer, outsider, property, chat };
}

const participantRows = (chatId: number) =>
  db()
    .select()
    .from(chatParticipants)
    .where(eq(chatParticipants.chatId, chatId))
    .orderBy(chatParticipants.userId);

describe("chat participant checks", () => {
  it("an outsider gets 404, not the thread, when reading its messages", async () => {
    const { outsider, chat } = await seed();

    const response = await call(`/api/chats/${chat.id}/messages`, {
      cookie: await sessionCookie(outsider),
    });

    expect(response.status).toBe(404);
    expect(JSON.stringify(await response.json())).not.toContain(
      "Fixture message",
    );
  });

  it("a participant can read the same thread (positive control)", async () => {
    const { buyer, chat } = await seed();

    const response = await call(`/api/chats/${chat.id}/messages`, {
      cookie: await sessionCookie(buyer),
    });

    expect(response.status).toBe(200);
    expect((await response.json()) as { messages: unknown[] }).toMatchObject({
      id: chat.id,
      messages: [{ text: "Fixture message" }],
    });
  });

  it("an outsider cannot post into the chat", async () => {
    const { outsider, chat } = await seed();
    const before = await db()
      .select()
      .from(chats)
      .where(eq(chats.id, chat.id))
      .get();

    const response = await call(`/api/chats/${chat.id}/messages`, {
      method: "POST",
      cookie: await sessionCookie(outsider),
      json: { text: "intrusion" },
    });

    expect(response.status).toBe(404);
    expect(await db().select().from(messages)).toHaveLength(1);
    expect(
      await db().select().from(chats).where(eq(chats.id, chat.id)).get(),
    ).toEqual(before);
  });

  it("an outsider marking the chat read changes no participant's watermark", async () => {
    const { outsider, chat } = await seed();
    const before = await participantRows(chat.id);

    // The route answers { ok: true } regardless; what matters is that the update matched no rows
    await call(`/api/chats/${chat.id}/read`, {
      method: "POST",
      cookie: await sessionCookie(outsider),
    });

    expect(await participantRows(chat.id)).toEqual(before);
  });

  it("an outsider does not see the chat in their list or unread count", async () => {
    const { outsider, agent } = await seed();
    const outsiderCookie = await sessionCookie(outsider);

    const list = await call("/api/chats", { cookie: outsiderCookie });
    const unread = await call("/api/chats/unread-count", {
      cookie: outsiderCookie,
    });
    const agentUnread = await call("/api/chats/unread-count", {
      cookie: await sessionCookie(agent),
    });

    expect(await list.json()).toEqual([]);
    expect(await unread.json()).toEqual({ count: 0 });
    // Positive control: the real recipient does have one unread sender
    expect(await agentUnread.json()).toEqual({ count: 1 });
  });

  it("an outsider cannot start a chat about a listing the named agent does not manage", async () => {
    const { outsider, property } = await seed();
    const otherAgent = await createUser("agent");

    const response = await call("/api/chats", {
      method: "POST",
      cookie: await sessionCookie(outsider),
      json: { agentId: otherAgent.id, propertyId: property.id },
    });

    expect(response.status).toBe(400);
    expect(await db().select().from(chats)).toHaveLength(1);
  });
});
