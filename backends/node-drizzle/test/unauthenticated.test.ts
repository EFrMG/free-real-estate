import { sign } from "hono/jwt";
import { describe, expect, it } from "vitest";

import { bookmarks, chats, messages, properties } from "../src/db/schema.ts";
import { call, createChat, createProperty, createUser, db } from "./helpers.ts";

// Every route mounted behind `requireAuth`. `:user`, `:property` and `:chat` are filled with real fixture ids so a 401 can't be confused with a 404
const protectedRoutes = [
  ["POST", "/api/properties"],
  ["PUT", "/api/properties/:property"],
  ["DELETE", "/api/properties/:property"],
  ["POST", "/api/auth/logout"],
  ["GET", "/api/auth/me"],
  ["PUT", "/api/users/:user"],
  ["PUT", "/api/users/:user/password"],
  ["POST", "/api/users/:user/promote"],
  ["POST", "/api/users/:user/bookmarks"],
  ["GET", "/api/users/:user/bookmarks"],
  ["DELETE", "/api/users/:user/bookmarks/:property"],
  ["GET", "/api/chats"],
  ["GET", "/api/chats/poll?chat=:chat"],
  ["GET", "/api/chats/:chat/messages"],
  ["POST", "/api/chats"],
  ["POST", "/api/chats/:chat/messages"],
  ["POST", "/api/chats/:chat/read"],
] as const;

async function seed() {
  const agent = await createUser("agent");
  const buyer = await createUser("user");
  const property = await createProperty(agent.id);
  const chat = await createChat(property.id, buyer.id, agent.id);

  const fill = (path: string) =>
    path
      .replace(":user", String(buyer.id))
      .replace(":property", String(property.id))
      .replace(":chat", String(chat.id));

  return { agent, buyer, property, chat, fill };
}

// A body every mutating route would otherwise accept, so the only thing standing between it and a write is authentication
const body = (ids: Awaited<ReturnType<typeof seed>>) => ({
  agentId: ids.agent.id,
  propertyId: ids.property.id,
  text: "should never be stored",
  name: "should never be stored",
  currentPassword: "x",
  newPassword: "y",
  agencyPassword: "test-only-promotion-code",
  licenseNumber: "x",
});

async function counts() {
  return {
    properties: (await db().select().from(properties)).length,
    chats: (await db().select().from(chats)).length,
    messages: (await db().select().from(messages)).length,
    bookmarks: (await db().select().from(bookmarks)).length,
  };
}

const forgedCookies = {
  "no cookie": async () => undefined,
  "a JWT signed with another key": async () =>
    `session=${await sign({ id: 1, role: "agent", exp: Math.floor(Date.now() / 1000) + 3600 }, "attacker-key")}`,
  "a malformed JWT": async () => "session=not.a.jwt",
  "an unknown refresh token": async () => "refresh=never-issued",
};

describe("unauthenticated requests", () => {
  for (const [label, makeCookie] of Object.entries(forgedCookies)) {
    it.each(protectedRoutes)(
      `%s %s with ${label} is 401`,
      async (method, path) => {
        const ids = await seed();
        const before = await counts();

        const response = await call(ids.fill(path), {
          method,
          cookie: await makeCookie(),
          json: method === "GET" || method === "DELETE" ? undefined : body(ids),
        });

        expect(response.status).toBe(401);
        expect(await counts()).toEqual(before);
      },
    );
  }
});
