import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { type SQL, eq, and, gte, lte, like, asc } from "drizzle-orm";
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
  deleteCookie,
  COOKIE_NAME,
} from "./auth.ts";

import type {
  AgentProfileData,
  UserBasic,
  UserProfile,
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
    // TODO: Add specific route if hosted.
    // When developing, ports might change so we let Hono decide it for the headers
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

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) return c.json({ error: "Email is already in use!" }, 409);

  const passwordHash = await argon2.hash(password);

  const [user] = await db
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
    });

  const session = { id: user.id, role: user.role } as UserSession;
  await setSessionCookie(c, session);

  return c.json(user, 201);
});

// Log in as a user
api.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json();

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user) return c.json({ error: "Invalid credentials!" }, 401);

  const passwordVerify = await argon2.verify(user.passwordHash, password);

  if (!passwordVerify) return c.json({ error: "Invalid credentials!" }, 401);

  const session = { id: user.id, role: user.role } as UserSession;
  await setSessionCookie(c, session);

  return c.json(session);
});

// Log out
api.post("/auth/logout", (c) => {
  deleteCookie(c, COOKIE_NAME, { path: "/" });

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
      // We could omit this conditional spread to better match UserProfile, given that the fields are nullable anyhow
      // I just think this way the DB has to do less work
      ...(session.role === "agent"
        ? {
            licenseNumber: agentProfiles.licenseNumber,
            phoneNumber: agentProfiles.phoneNumber,
            bio: agentProfiles.bio,
          }
        : {}),
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

  const { name, licenseNumber, phoneNumber, bio } = body;
  let profilePicture = body.profilePicture;

  // Core users table
  const userUpdates: Partial<UserBasic> = {};

  if (name !== undefined) userUpdates["name"] = name;

  // Handle profile picture file upload
  if (profilePicture instanceof File) {
    const file = profilePicture;
    const fileName = `${id}-${Date.now()}-${file.name}`; // Good enough to avoid duplicates

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

    if (bio !== undefined) agentUpdates["bio"] = bio;

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

// Promote a normal user to agent
api.post("/users/:id/promote", requireAuth, async (c) => {
  const id = Number(c.req.param("id"));

  if (c.get("user").id !== id) return c.json({ error: "Forbidden" }, 403);

  const { adminCode, licenseNumber } = await c.req.json();
  const secret =
    process.env.AGENT_PROMOTION_CODE ?? "agent-code--change-in-prod";

  if (adminCode !== secret)
    return c.json({ error: "Invalid promotion code" }, 401);

  // Update role to agent
  await db.update(users).set({ role: "agent" }).where(eq(users.id, id));

  await db
    .insert(agentProfiles)
    .values({ userId: id, licenseNumber })
    .onConflictDoNothing();

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
