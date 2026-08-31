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
import {
  userData,
  propertyData,
  agentProfileData,
  chatData,
  chatParticipantData,
  messageData,
  /*, postData */
} from "./generalDataSeed.ts";
import argon2 from "argon2";

const clearAllColumns = true;

/**
 * Wipes every table back to empty and reloads the default demo data.
 * Exported so it can be run both as a one-off CLI script (`pnpm seed`) and called from within the running server for the daily automatic reset.
 */
export async function seedDatabase(): Promise<void> {
  console.log("Seed started...");

  if (clearAllColumns) {
    console.log("Clearing existing data...");
    // Deletes must respect foreign keys that don't cascade:
    // chats -> properties and properties -> users are both RESTRICT; the referencing table has to go first. Everything else cascades on its own.
    await db.delete(messages);
    await db.delete(chatParticipants);
    await db.delete(chats);
    await db.delete(bookmarks);
    await db.delete(agentProfiles);
    await db.delete(properties);
    await db.delete(users);
    // await db.delete(posts);

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

  // Chats reference properties, so they only go in once those exist
  console.log("Seeding chats...");
  await db.insert(chats).values(chatData).onConflictDoNothing();

  console.log("Seeding chat participants...");
  await db
    .insert(chatParticipants)
    .values(chatParticipantData)
    .onConflictDoNothing();

  console.log("Seeding messages...");
  await db.insert(messages).values(messageData).onConflictDoNothing();

  // console.log("Seeding posts...");
  // await db.insert(posts).values(postData).onConflictDoNothing();

  console.log("Seed finished successfully!");
}

// CLI entry point, only running when this file is executed directly (`pnpm seed` / `tsx src/db/seed.ts`), not when imported by the server.
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
}
