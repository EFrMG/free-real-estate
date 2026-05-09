import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { type SQL, eq, and, gte, lte, like, asc } from "drizzle-orm";
import { db } from "./db/index.ts";
import { properties, users, posts } from "./db/schema.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Free Real Estate API.");
});

const api = app.basePath("/api");

// Enable CORS for the frontend
api.use("/*", cors());

// GET all properties while filtering
api.get("/properties", async (c) => {
  // Query parameter values
  const { type, city, minPrice, maxPrice, bedrooms, bathrooms } = c.req.query();

  const filters: SQL[] = [];

  // "property" type left to do and add data for

  if (type && type !== "any") {
    filters.push(eq(properties.type, type as "buy" | "rent"));
  }

  if (city) {
    filters.push(like(properties.city, `%${city}%`));
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

// GET all users
api.get("/users", async (c) => {
  const result = await db.select().from(users);

  return c.json(result);
});

// GET single user
api.get("/users/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const result = await db.select().from(users).where(eq(users.id, id)).get();

  if (!result) return c.json({ error: "User not found" }, 404);

  return c.json(result);
});

// GET all posts
api.get("/posts", async (c) => {
  const result = await db.select().from(posts);

  return c.json(result);
});

const port = 3000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is now running on: http://localhost:${port}`);
