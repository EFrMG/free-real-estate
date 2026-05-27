import { db } from "./index.ts";
import {
  users,
  properties,
  // posts,
  chats,
  chatParticipants,
  messages,
  bookmarks,
  agentProfiles,
} from "./schema.ts";
import { userData, propertyData, agentProfileData /*, postData */ } from "./generalDataSeed.ts";
import argon2 from "argon2";

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
      await db.delete(agentProfiles);
      await db.delete(properties);
      // await db.delete(posts);
      await db.delete(chats);
      await db.delete(users);

      console.log("Columns cleared first.");
    }

    console.log("Seeding users with placeholder passwords...");
    const defaultPasswordHash = await argon2.hash("password123");
    const usersToInsert = userData.map((u) => ({
      ...u,
      passwordHash: u.passwordHash || defaultPasswordHash,
    }));
    await db.insert(users).values(usersToInsert).onConflictDoNothing();

    console.log("Seeding properties...");
    await db.insert(properties).values(propertyData).onConflictDoNothing();

    console.log("Seeding agent profiles...");
    await db.insert(agentProfiles).values(agentProfileData).onConflictDoNothing();

    // console.log("Seeding posts...");
    // await db.insert(posts).values(postData).onConflictDoNothing();

    console.log("Seed finished successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
