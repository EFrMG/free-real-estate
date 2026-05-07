import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { properties, users, posts } from "./db/schema.ts";

const app = new Hono();

// Enable CORS for the frontend
app.use("/*", cors());

app.get("/", (c) => {
  return c.text("Free Real Estate API is running!");
});

// GET all properties
app.get("/api/properties", async (c) => {
  const result = await db.select().from(properties);
  return c.json(result);
});

// GET single property
app.get("/api/properties/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .get();

  if (!result) return c.json({ error: "Property not found" }, 404);
  return c.json(result);
});

// GET all users
app.get("/api/users", async (c) => {
  const result = await db.select().from(users);
  return c.json(result);
});

// GET single user
app.get("/api/users/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await db.select().from(users).where(eq(users.id, id)).get();

  if (!result) return c.json({ error: "User not found" }, 404);
  return c.json(result);
});

// GET all posts
app.get("/api/posts", async (c) => {
  const result = await db.select().from(posts);
  return c.json(result);
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
