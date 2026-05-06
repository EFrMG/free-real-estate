import { db } from "./index.ts";
import { users, properties, posts } from "./schema.ts";
import { userData, propertyData, postData } from "./generalDataSeed.ts";

async function seed() {
  console.log("Seed started...");

  try {
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
