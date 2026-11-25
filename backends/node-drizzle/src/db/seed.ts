import type { Database } from "./index.ts";
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

const clearAllColumns = true;

/**
 * scrypt hash of the public demo password `password123`, given to every seed user whose `passwordHash` is empty.
 *
 * Precomputed so the daily reset doesn't spend a scrypt derivation on every run. It was produced once with Node's `crypto.scryptSync("password123", randomBytes(16), 32, { N: 16384, r: 8, p: 1 })` and joined in the same `scrypt$N$r$p$salt$key` format `hashPassword` writes, so `verifyPassword` reads it like any other stored hash.
 */
export const DEFAULT_PASSWORD_HASH =
  "scrypt$16384$8$1$F5Q+fb0sOGp2viPBx6/bVw==$mbS9YFGypDH3m6vMXHDO+0jyPGsZUBhGf9eyHu82SZ8=";

/**
 * Wipes every table back to empty and reloads the default demo data.
 * Called by the Worker's daily Cron Trigger.
 */
export async function seedDatabase(db: Database): Promise<void> {
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
  const usersToInsert = userData.map((u) => ({
    ...u,
    passwordHash: u.passwordHash || DEFAULT_PASSWORD_HASH,
  }));
  await db.insert(users).values(usersToInsert).onConflictDoNothing();

  console.log("Seeding properties...");
  // D1 accepts at most 100 bound parameters per query. Each property has 20 columns, so batches of four leave room for future columns without approaching the limit.
  const propertyBatchSize = 4;
  for (let index = 0; index < propertyData.length; index += propertyBatchSize) {
    await db
      .insert(properties)
      .values(propertyData.slice(index, index + propertyBatchSize))
      .onConflictDoNothing();
  }

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
