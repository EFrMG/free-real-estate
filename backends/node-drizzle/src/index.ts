import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import {
  type SQL,
  eq,
  ne,
  and,
  gt,
  gte,
  lte,
  like,
  asc,
  desc,
  inArray,
} from "drizzle-orm";
import argon2 from "argon2";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

import { db } from "./db/index.ts";
import {
  type PropertyData,
  users,
  agentProfiles,
  properties,
  // posts,
  bookmarks,
  chats,
  chatParticipants,
  messages,
} from "./db/schema.ts";

import {
  type UserSession,
  requireAuth,
  setSessionCookie,
  createRefreshToken,
  revokeAllUserSessions,
  clearAuthCookies,
} from "./auth.ts";

import selectUserChats from "./utils/selectUserChats.ts";
import toChatSummary from "./utils/toChatSummary.ts";

import type {
  AgentProfileData,
  UserBasic,
  UserProfile,
  ChatSummary,
  ChatThreadData,
  MessageData,
} from "@free-real-estate/shared";

const app = new Hono();

// Serve static files
app.use("/public/*", serveStatic({ root: "./" }));

app.get("/", (c) => {
  return c.text("Free Real Estate API.");
});

const api = app.basePath("/api");

// Enable CORS for the frontend
api.use(
  "/*",
  cors({
    credentials: true,
    /* TODO: Add specific route if hosted.
      When developing, ports might change so we let Hono decide it for the headers */
  }),
);

// Properties --.

// GET all properties while filtering
api.get("/properties", async (c) => {
  // Query parameter values
  const { type, property, city, minPrice, maxPrice, bedrooms, bathrooms } =
    c.req.query();

  const filters: SQL[] = [];

  if (city) {
    filters.push(like(properties.city, `%${city}%`));
  }

  if (type && type !== "any") {
    filters.push(
      eq(properties.transactionType, type as PropertyData["transactionType"]),
    );
  }

  if (property && property !== "any") {
    filters.push(
      eq(properties.propertyType, property as PropertyData["propertyType"]),
    );
  }

  if (minPrice) {
    filters.push(gte(properties.price, Number(minPrice)));
  }

  if (maxPrice) {
    filters.push(lte(properties.price, Number(maxPrice)));
  }

  if (bedrooms) {
    filters.push(eq(properties.bedrooms, Number(bedrooms)));
  }

  if (bathrooms) {
    filters.push(eq(properties.bathrooms, Number(bathrooms)));
  }

  const result = await db
    .select()
    .from(properties)
    .where(and(...filters));

  return c.json(result);
});

// GET single property
api.get("/properties/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const result = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .get(); // get one result instead of an array

  if (!result) return c.json({ error: "Property not found" }, 404);

  return c.json(result);
});

// GET all unique cities
api.get("/cities", async (c) => {
  const result = await db
    .selectDistinct({ city: properties.city })
    .from(properties)
    .orderBy(asc(properties.city));

  // Turn the array of objects into one of strings
  return c.json(result.map((r) => r.city));
});

// Authentication --.

const registerSchema = z.object({
  email: z.email({ pattern: z.regexes.html5Email }),
  password: z
    .string()
    .min(8, "Your password must at least contain 8 characters!"),
  name: z.string().min(1, "Please, enter your name."),
  profilePicture: z.string().nullish(),
});

// Register a user
api.post("/auth/register", async (c) => {
  const bodyRes = registerSchema.safeParse(await c.req.json());

  if (!bodyRes.success) {
    return c.json({ error: z.flattenError(bodyRes.error) }, 400);
  }

  const { email, password, name, profilePicture } = bodyRes.data;

  const emailExists = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (emailExists) return c.json({ error: "Email is already in use." }, 409);

  const passwordHash = await argon2.hash(password);

  const user = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      profilePicture: profilePicture ?? "",
      role: "user",
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      profilePicture: users.profilePicture,
    })
    .get();

  const session = { id: user.id, role: user.role } as UserSession;
  await setSessionCookie(c, session);
  await createRefreshToken(c, user.id);

  return c.json(user, 201);
});

const loginSchema = z.object({
  email: z.email({ pattern: z.regexes.html5Email }),
  password: z.string().min(1, "A password is required!"),
});

// Log in as a user
api.post("/auth/login", async (c) => {
  const bodyRes = loginSchema.safeParse(await c.req.json());

  if (!bodyRes.success) {
    return c.json({ error: z.flattenError(bodyRes.error) }, 400);
  }

  const { email, password } = bodyRes.data;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user) return c.json({ error: "Invalid email." }, 401);

  const passwordVerified = await argon2.verify(user.passwordHash, password);

  if (!passwordVerified) return c.json({ error: "Invalid password!" }, 401);

  const session = { id: user.id, role: user.role } as UserSession;
  await setSessionCookie(c, session);
  await createRefreshToken(c, user.id);

  return c.json(session);
});

// Log out
api.post("/auth/logout", requireAuth, async (c) => {
  const session = c.get("user") as UserSession;

  await revokeAllUserSessions(session.id);
  clearAuthCookies(c);

  return c.json({ ok: true });
});

// Authenticate user
api.get("/auth/me", requireAuth, async (c) => {
  const session = c.get("user") as UserSession;

  const user = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      profilePicture: users.profilePicture,
      licenseNumber: agentProfiles.licenseNumber,
      phoneNumber: agentProfiles.phoneNumber,
      biography: agentProfiles.biography,
    })
    .from(users)
    .leftJoin(agentProfiles, eq(users.id, agentProfiles.userId))
    .where(eq(users.id, session.id))
    .get();

  if (!user) return c.json({ error: "User not found." }, 404);

  return c.json(user satisfies UserProfile);
});

// Users --.

// GET all user agents
api.get("/users", async (c) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      profilePicture: users.profilePicture,
      role: users.role,
    })
    .from(users)
    .where(eq(users.role, "agent"));

  return c.json(result);
});

// GET single user agent
api.get("/users/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      profilePicture: users.profilePicture,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "agent")))
    .get();

  if (!result) return c.json({ error: "User not found" }, 404);

  if (result.role === "agent") {
    const profile = await db
      .select()
      .from(agentProfiles)
      .where(eq(agentProfiles.userId, id))
      .get();

    return c.json({ ...result, profile });
  }

  return c.json(result);
});

// Update user profile (both regular and agent fields)
api.put("/users/:id", requireAuth, async (c) => {
  // Constants for file upload security
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const id = Number(c.req.param("id"));

  if (c.get("user").id !== id) return c.json({ error: "Forbidden" }, 403);

  // Handle both JSON and Multipart for file uploads
  const contentType = c.req.header("Content-Type") || "";
  let body: any;

  if (contentType.includes("multipart/form-data")) {
    body = await c.req.parseBody();
  } else {
    body = await c.req.json();
  }

  const { name, licenseNumber, phoneNumber, biography } = body;
  let profilePicture = body.profilePicture;

  // Core users table
  const userUpdates: Partial<UserBasic> = {};

  if (name !== undefined) userUpdates["name"] = name;

  // Handle profile picture file upload
  if (profilePicture instanceof File) {
    const file = profilePicture;

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return c.json(
        {
          error: "Invalid file type. Only JPEG, PNG and WEBP are allowed",
        },
        400,
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: "File size exceeds the 5MB limit" }, 400);
    }

    // Sanitize filename and prepare path
    const extension = file.type.split("/")[1];
    const fileName = `${id}-${Date.now()}.${extension}`;

    const filePath = path.join(
      "public",
      "uploads",
      "profile-pictures",
      fileName,
    );

    const arrayBuffer = await file.arrayBuffer();

    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    userUpdates["profilePicture"] =
      `/public/uploads/profile-pictures/${fileName}`;
  } else if (
    typeof profilePicture === "string" &&
    profilePicture !== undefined
  ) {
    userUpdates["profilePicture"] = profilePicture;
  }

  if (Object.keys(userUpdates).length) {
    await db.update(users).set(userUpdates).where(eq(users.id, id));
  }

  // Agent profile updates
  const session = c.get("user") as UserSession;

  if (session.role === "agent") {
    const agentUpdates: Partial<AgentProfileData> = {};

    if (licenseNumber !== undefined)
      agentUpdates["licenseNumber"] = licenseNumber;

    if (phoneNumber !== undefined) agentUpdates["phoneNumber"] = phoneNumber;

    if (biography !== undefined) agentUpdates["biography"] = biography;

    if (Object.keys(agentUpdates).length) {
      await db
        .update(agentProfiles)
        .set(agentUpdates)
        .where(eq(agentProfiles.userId, id));
    }
  }

  return c.json({
    ok: true,
    profilePicture: userUpdates.profilePicture,
  });
});

// Change user password
api.put("/users/:id/password", requireAuth, async (c) => {
  const id = Number(c.req.param("id"));

  if (c.get("user").id !== id) return c.json({ error: "Forbidden" }, 403);

  const { currentPassword, newPassword } = await c.req.json();

  if (!currentPassword || !newPassword) {
    return c.json({ error: "Missing required fields." }, 400);
  }

  const user = await db.select().from(users).where(eq(users.id, id)).get();

  if (!user) return c.json({ error: "User not found" }, 404);

  const passwordVerify = await argon2.verify(
    user.passwordHash,
    currentPassword,
  );

  if (!passwordVerify)
    return c.json({ error: "Invalid current password!" }, 401);

  const passwordHash = await argon2.hash(newPassword);

  await db.update(users).set({ passwordHash }).where(eq(users.id, id));

  // Revoke all existing sessions, then re-issue for the current device
  await revokeAllUserSessions(id);
  await setSessionCookie(c, { id, role: user.role } as UserSession);
  await createRefreshToken(c, id);

  return c.json({ ok: true });
});

// Promote a normal user to agent user
api.post("/users/:id/promote", requireAuth, async (c) => {
  const id = Number(c.req.param("id"));

  if (c.get("user").id !== id) return c.json({ error: "Forbidden" }, 403);

  const { agencyPassword, licenseNumber } = await c.req.json();
  const secret =
    process.env.AGENT_PROMOTION_CODE ?? "agent-code--change-in-prod";

  if (agencyPassword !== secret)
    return c.json({ error: "Invalid promotion password!" }, 401);

  // Update role to agent
  await db.update(users).set({ role: "agent" }).where(eq(users.id, id));

  await db
    .insert(agentProfiles)
    .values({ userId: id, licenseNumber })
    .onConflictDoNothing();

  // Re-issue tokens with the new role
  await revokeAllUserSessions(id);
  await setSessionCookie(c, { id, role: "agent" });
  await createRefreshToken(c, id);

  return c.json({ ok: true });
});

// GET properties owned by an agent
api.get("/users/:id/properties", async (c) => {
  const id = Number(c.req.param("id"));

  const results = await db
    .select()
    .from(properties)
    .where(eq(properties.userId, id));

  return c.json(results);
});

// Bookmarks --.

// Create bookmark
api.post("/users/:id/bookmarks", requireAuth, async (c) => {
  const userId = Number(c.req.param("id"));

  if (c.get("user").id !== userId) return c.json({ error: "Forbidden" }, 403);

  const { propertyId } = await c.req.json();

  await db
    .insert(bookmarks)
    .values({ userId, propertyId })
    .onConflictDoNothing();

  return c.json({ ok: true }, 201);
});

// Retrieve bookmarks
api.get("/users/:id/bookmarks", requireAuth, async (c) => {
  const userId = Number(c.req.param("id"));

  if (c.get("user").id !== userId) return c.json({ error: "Forbidden" }, 403);

  const result = await db
    .select({ property: properties })
    .from(bookmarks)
    .innerJoin(properties, eq(bookmarks.propertyId, properties.id))
    .where(eq(bookmarks.userId, userId));

  return c.json(result.map((r) => r.property));
});

// Delete bookmark
api.delete("/users/:id/bookmarks/:propertyId", requireAuth, async (c) => {
  const userId = Number(c.req.param("id"));

  if (c.get("user").id !== userId) return c.json({ error: "Forbidden" }, 403);

  const propertyId = Number(c.req.param("propertyId"));

  await db
    .delete(bookmarks)
    .where(
      and(eq(bookmarks.userId, userId), eq(bookmarks.propertyId, propertyId)),
    );

  return c.json({ ok: true }, 200);
});

// Chats --.

// GET the number of people with unread messages
api.get("/chats/unread-count", requireAuth, async (c) => {
  const session = c.get("user") as UserSession;

  const senders = await db
    .selectDistinct({ senderId: messages.senderId })
    .from(messages)
    .innerJoin(
      chatParticipants,
      and(
        eq(chatParticipants.chatId, messages.chatId),
        eq(chatParticipants.userId, session.id),
      ),
    )
    .where(
      and(
        ne(messages.senderId, session.id),
        // ISO 8601 sorts lexicographically, so a string compare is chronological
        gt(messages.createdAt, chatParticipants.lastReadAt),
      ),
    );

  return c.json({ count: senders.length });
});

// GET every conversation of the authenticated user, most recent first
api.get("/chats", requireAuth, async (c) => {
  const session = c.get("user") as UserSession;

  const rows = await selectUserChats(session.id).orderBy(desc(chats.updatedAt));

  if (!rows.length) return c.json([] satisfies ChatSummary[]);

  // One extra query for every chat at once, rather than one per chat
  const chatMessages = await db
    .select()
    .from(messages)
    .where(
      inArray(
        messages.chatId,
        rows.map((row) => row.id),
      ),
    )
    .orderBy(asc(messages.createdAt));

  const result = rows.map((row) =>
    toChatSummary(
      row,
      chatMessages.filter((message) => message.chatId === row.id),
      session.id,
    ),
  );

  return c.json(result satisfies ChatSummary[]);
});

// GET a single conversation along with its full message history
api.get("/chats/:id/messages", requireAuth, async (c) => {
  const session = c.get("user") as UserSession;
  const chatId = Number(c.req.param("id"));

  // Non-participants get a 404 rather than a 403 for chats to stay unenumerable
  const row = await selectUserChats(session.id)
    .where(eq(chats.id, chatId))
    .get();

  if (!row) return c.json({ error: "Chat not found" }, 404);

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt));

  const result = {
    ...toChatSummary(row, chatMessages, session.id),
    messages: chatMessages,
  };

  return c.json(result satisfies ChatThreadData);
});

const startChatSchema = z.object({
  agentId: z.number().int().positive(),
  propertyId: z.number().int().positive(),
});

// Open the conversation with an agent about one of their properties, reusing it if it exists
api.post("/chats", requireAuth, async (c) => {
  const session = c.get("user") as UserSession;

  const bodyRes = startChatSchema.safeParse(await c.req.json());

  if (!bodyRes.success) {
    return c.json({ error: z.flattenError(bodyRes.error) }, 400);
  }

  const { agentId, propertyId } = bodyRes.data;

  if (agentId === session.id) {
    return c.json({ error: "You cannot start a chat with yourself." }, 400);
  }

  const agent = await db
    .select()
    .from(users)
    .where(and(eq(users.id, agentId), eq(users.role, "agent")))
    .get();

  if (!agent) return c.json({ error: "Agent not found." }, 404);

  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .get();

  if (!property) return c.json({ error: "Property not found." }, 404);

  if (property.userId !== agentId) {
    return c.json(
      { error: "That property is not managed by this agent." },
      400,
    );
  }

  // Narrowing by users.id restricts the counterpart to the agent in question
  const existing = await selectUserChats(session.id)
    .where(and(eq(chats.propertyId, propertyId), eq(users.id, agentId)))
    .get();

  if (existing) return c.json({ chatId: existing.id });

  const now = new Date().toISOString();

  const chat = await db
    .insert(chats)
    .values({ propertyId, updatedAt: now })
    .returning({ id: chats.id })
    .get();

  await db.insert(chatParticipants).values([
    { chatId: chat.id, userId: session.id, lastReadAt: now },
    { chatId: chat.id, userId: agentId, lastReadAt: now },
  ]);

  return c.json({ chatId: chat.id }, 201);
});

const sendMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Write something before sending.")
    .max(2000, "Messages are limited to 2000 characters."),
});

// Post a message into a conversation
api.post("/chats/:id/messages", requireAuth, async (c) => {
  const session = c.get("user") as UserSession;
  const chatId = Number(c.req.param("id"));

  const bodyRes = sendMessageSchema.safeParse(await c.req.json());

  if (!bodyRes.success) {
    return c.json({ error: z.flattenError(bodyRes.error) }, 400);
  }

  const participation = await db
    .select()
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.chatId, chatId),
        eq(chatParticipants.userId, session.id),
      ),
    )
    .get();

  if (!participation) return c.json({ error: "Chat not found" }, 404);

  const now = new Date().toISOString();

  const message = await db
    .insert(messages)
    .values({
      chatId,
      senderId: session.id,
      text: bodyRes.data.text,
      createdAt: now,
    })
    .returning()
    .get();

  // Bump the conversation so it sorts first and keep the sender updated
  await db.update(chats).set({ updatedAt: now }).where(eq(chats.id, chatId));

  await db
    .update(chatParticipants)
    .set({ lastReadAt: now })
    .where(
      and(
        eq(chatParticipants.chatId, chatId),
        eq(chatParticipants.userId, session.id),
      ),
    );

  return c.json(message satisfies MessageData, 201);
});

// Move the reader's watermark up to now, clearing the conversation's unread count
api.post("/chats/:id/read", requireAuth, async (c) => {
  const session = c.get("user") as UserSession;
  const chatId = Number(c.req.param("id"));

  await db
    .update(chatParticipants)
    .set({ lastReadAt: new Date().toISOString() })
    .where(
      and(
        eq(chatParticipants.chatId, chatId),
        eq(chatParticipants.userId, session.id),
      ),
    );

  return c.json({ ok: true });
});

// Posts --.

// TODO: blog feature
// GET all posts
// api.get("/posts", async (c) => {
//   const result = await db.select().from(posts);
//
//   return c.json(result);
// });

const port = 3000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is now running on: http://localhost:${port}`);
