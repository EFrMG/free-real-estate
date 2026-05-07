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
  name: text().notNull(),
  // We have to handle a placeholder on user interaction in case of null
  // src attribute cannot be properly null ⌄
  profilePicture: text().notNull(),
});

export const properties = sqliteTable("properties", {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: integer().references(() => users.id),
  type: text("type", { enum: ["buy", "rent"] }).notNull(),
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

export const posts = sqliteTable("posts", {
  id: integer().primaryKey({ autoIncrement: true }),
  authorId: integer().references(() => users.id),
  title: text().notNull(),
  excerpt: text().notNull(),
  content: text().notNull(),
  postImage: text().notNull(),
  date: text().notNull(),
});

export const chats = sqliteTable("chats", {
  id: integer().primaryKey({ autoIncrement: true }),
  updatedAt: text().notNull(),
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

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: integer()
    .notNull()
    .references(() => chats.id),
  senderId: integer()
    .notNull()
    .references(() => users.id),
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
