import {
  sqliteTable,
  primaryKey,
  text,
  integer,
  real,
  customType,
} from "drizzle-orm/sqlite-core";

// JSON type helper
const json = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "text";
    },
    toDriver(value: TData): string {
      return JSON.stringify(value);
    },
    fromDriver(value: string): TData {
      return JSON.parse(value);
    },
  })(name);

export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  name: text().notNull(),
  role: text("role", { enum: ["agent", "user"] })
    .notNull()
    .default("user"),
  profilePicture: text().notNull().default(""),
});

export const agentProfiles = sqliteTable("agent_profiles", {
  userId: integer()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  licenseNumber: text().notNull(),
  phoneNumber: text(),
  bio: text(),
});

export const properties = sqliteTable("properties", {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: integer().references(() => users.id, { onDelete: "cascade" }),
  transactionType: text("transaction_type", {
    enum: ["buy", "rent"],
  }).notNull(),
  status: text("status", {
    enum: ["free", "unavailable", "inactive"],
  })
    .notNull()
    .default("free"),
  propertyType: text("property_type", {
    enum: ["apartment", "house", "condominium"],
  }).notNull(),
  title: text().notNull(),
  description: text().notNull(),
  longDescription: text(),
  exteriorImage: text().notNull(),
  interiorGallery: json<string[]>("interior_gallery"),
  sizes: json<number[]>("sizes"),
  bedrooms: integer().notNull(),
  bathrooms: integer().notNull(),
  price: integer().notNull(),
  province: text().notNull(),
  city: text().notNull(),
  address: text().notNull(),
  nearbyPlaces: json<Record<string, `${number}m`>>("nearby_places"),
  latitude: real().notNull(),
  longitude: real().notNull(),
});

// TODO: post feature. This will come after chats are fully developed
// export const posts = sqliteTable("posts", {
//   id: integer().primaryKey({ autoIncrement: true }),
//   authorId: integer().references(() => users.id, { onDelete: "cascade" }),
//   title: text().notNull(),
//   excerpt: text().notNull(),
//   content: text().notNull(),
//   postImage: text().notNull(),
//   date: text().notNull(),
// });

export const chats = sqliteTable("chats", {
  id: integer().primaryKey({ autoIncrement: true }),
  updatedAt: text().notNull(),
  propertyId: integer()
    .notNull()
    .references(() => properties.id),
});

// Chat participants (Many-to-Many)
export const chatParticipants = sqliteTable(
  "chat_participants",
  {
    chatId: integer()
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.chatId, table.userId] })],
);

// Chats
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: integer()
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  senderId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text().notNull(),
  createdAt: text().notNull(),
});

// Bookmarks (Many-to-Many)
export const bookmarks = sqliteTable(
  "bookmarks",
  {
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: integer()
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.propertyId] })],
);
