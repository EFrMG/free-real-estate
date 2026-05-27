import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { type SQL, eq, and, gte, lte, like, asc } from "drizzle-orm";
import argon2 from "argon2";
import { z } from "zod";

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
  requireAgent,
  setSessionCookie,
  deleteCookie,
  COOKIE_NAME,
} from "./auth.ts";

const app = new Hono();

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

  await setSessionCookie(c, user as UserSession);

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

  const session: UserSession = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    profilePicture: user.profilePicture,
  };

  await setSessionCookie(c, session);

  return c.json(session);
});

// Log out
api.post("/auth/logout", (c) => {
  deleteCookie(c, COOKIE_NAME, { path: "/" });

  return c.json({ ok: true });
});

// Authenticate user
api.get("/auth/me", requireAuth, (c) => {
  return c.json(c.get("user"));
});

// Users --.

// GET all users
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

// GET single user
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
    .where(eq(users.id, id))
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

// Update agent profile
api.put("/users/:id/profile", requireAuth, requireAgent, async (c) => {
  const id = Number(c.req.param("id"));
  if (c.get("user").id !== id) return c.json({ error: "Forbidden" }, 403);
  
  const body = await c.req.json();
  const { bio, licenseNumber, phoneNumber } = body;
  
  await db
    .insert(agentProfiles)
    .values({ userId: id, bio, licenseNumber, phoneNumber })
    .onConflictDoUpdate({
      target: agentProfiles.userId,
      set: { bio, licenseNumber, phoneNumber },
    });
    
  return c.json({ ok: true });
});

// GET properties owned by a user
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
