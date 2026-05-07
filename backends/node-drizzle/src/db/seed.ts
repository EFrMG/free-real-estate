import { db } from "./index.ts";
import {
  users,
  properties,
  posts,
  chats,
  chatParticipants,
  messages,
  bookmarks,
} from "./schema.ts";
import { userData, propertyData, postData } from "./generalDataSeed.ts";

const clearAllColumns = true;

async function seed() {
  console.log("Seed started...");

  try {
    if (clearAllColumns) {
      console.log("Clearing existing data...");
      // Delete in reverse order of dependencies
      await db.delete(messages);
      await db.delete(chatParticipants);
      await db.delete(bookmarks);
      await db.delete(properties);
      await db.delete(posts);
      await db.delete(chats);
      await db.delete(users);

      console.log("Columns cleared first.");
    }

    console.log("Seeding users...");
    await db.insert(users).values(userData).onConflictDoNothing();

    console.log("Seeding properties...");
    await db.insert(properties).values(propertyData).onConflictDoNothing();

    console.log("Seeding posts...");
    await db.insert(posts).values(postData).onConflictDoNothing();

    console.log("Seed finished successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
