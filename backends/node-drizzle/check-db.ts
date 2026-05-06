import { db } from "./src/db/index.ts";
import { users, properties, posts } from "./src/db/schema.ts";
import { count } from "drizzle-orm";

async function check() {
  const usersCount = await db.select({ value: count() }).from(users);
  const propertiesCount = await db.select({ value: count() }).from(properties);
  const postsCount = await db.select({ value: count() }).from(posts);

  console.log({
    users: usersCount[0].value,
    properties: propertiesCount[0].value,
    posts: postsCount[0].value,
  });
  process.exit(0);
}

check();
