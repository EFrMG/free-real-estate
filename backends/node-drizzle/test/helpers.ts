import {
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { env } from "cloudflare:workers";
import { sign } from "hono/jwt";

import worker from "../src/index.ts";
import { createDb } from "../src/db/index.ts";
import {
  agentProfiles,
  chatParticipants,
  chats,
  messages,
  properties,
  refreshTokens,
  users,
} from "../src/db/schema.ts";

export const db = () => createDb(env.DB);

// Requests --.

interface CallOptions {
  method?: string;
  cookie?: string;
  json?: unknown;
}

/** Send one request through the Worker's real `fetch` handler, inside the test's isolated bindings. */
export async function call(path: string, options: CallOptions = {}) {
  const headers = new Headers();
  if (options.cookie) headers.set("Cookie", options.cookie);
  if (options.json !== undefined)
    headers.set("Content-Type", "application/json");

  const request = new Request(`http://localhost${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.json === undefined ? undefined : JSON.stringify(options.json),
  });

  const ctx = createExecutionContext();
  const response = await worker.fetch(
    request as Request<unknown, IncomingRequestCfProperties>,
    env,
    ctx,
  );
  await waitOnExecutionContext(ctx);

  return response;
}

/** `name=value` pairs from every Set-Cookie header, keeping only cookies the response sets (not deletions). */
export function setCookies(response: Response): Record<string, string> {
  const cookies: Record<string, string> = {};

  for (const header of response.headers.getSetCookie()) {
    const [pair] = header.split(";");
    const index = pair.indexOf("=");
    const value = pair.slice(index + 1);
    if (value && !/max-age=0/i.test(header))
      cookies[pair.slice(0, index)] = value;
  }

  return cookies;
}

// Fixtures --.

let sequence = 0;

/** Insert a user row directly. The password hash is a placeholder unless one is passed, since most tests mint their session instead of logging in. */
export async function createUser(
  role: "agent" | "user" = "user",
  passwordHash = "fixture-without-password",
) {
  sequence += 1;

  const user = await db()
    .insert(users)
    .values({
      email: `${role}-${sequence}@test.invalid`,
      passwordHash,
      name: `Test ${role} ${sequence}`,
      role,
    })
    .returning()
    .get();

  if (role === "agent")
    await db()
      .insert(agentProfiles)
      .values({ userId: user.id, licenseNumber: `LIC-${sequence}` });

  return user;
}

export async function createProperty(
  ownerId: number,
  exteriorImage = "/images/fixture.jpg",
) {
  return db()
    .insert(properties)
    .values({
      userId: ownerId,
      transactionType: "buy",
      propertyType: "house",
      title: `Fixture property ${ownerId}`,
      description: "Fixture description",
      exteriorImage,
      bedrooms: 2,
      bathrooms: 1,
      price: 100_000,
      province: "Fixture Province",
      city: "Fixture City",
      address: "1 Fixture Street",
      latitude: -31.4,
      longitude: -64.2,
    })
    .returning()
    .get();
}

/** A two-party chat about `propertyId`, with one message from `from` that `to` has not read yet. */
export async function createChat(propertyId: number, from: number, to: number) {
  const earlier = "2026-01-01T00:00:00.000Z";
  const later = "2026-01-02T00:00:00.000Z";

  const chat = await db()
    .insert(chats)
    .values({ propertyId, updatedAt: later })
    .returning()
    .get();

  await db()
    .insert(chatParticipants)
    .values([
      { chatId: chat.id, userId: from, lastReadAt: later },
      { chatId: chat.id, userId: to, lastReadAt: earlier },
    ]);

  await db()
    .insert(messages)
    .values({
      chatId: chat.id,
      senderId: from,
      text: "Fixture message",
      createdAt: later,
    });

  return chat;
}

// Sessions --.

/** A `session` cookie signed exactly as `setSessionCookie` signs one, with an explicit expiry (seconds since epoch). */
export async function sessionCookie(
  user: { id: number; role: "agent" | "user" },
  exp = Math.floor(Date.now() / 1000) + 3600,
) {
  const token = await sign({ id: user.id, role: user.role, exp }, env.JWT_KEY);
  return `session=${token}`;
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** Store a refresh token row for `userId` that expires at `expiresAt`, and return the raw token a browser would hold. */
export async function createRefresh(userId: number, expiresAt: Date) {
  sequence += 1;
  const token = `fixture-refresh-token-${sequence}`;

  await db()
    .insert(refreshTokens)
    .values({
      userId,
      tokenHash: await sha256Hex(token),
      family: `fixture-family-${sequence}`,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

  return token;
}
