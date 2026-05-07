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
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  // We have to handle a placeholder on user interaction in case of null
  // src attribute cannot be properly null ⌄
  profilePicture: text("profile_picture").notNull(),
});

export const properties = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  type: text("type", { enum: ["buy", "rent"] }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  exteriorImage: text("exterior_image").notNull(),
  interiorGallery: json<string[]>("interior_gallery"),
  sizes: json<number[]>("sizes"),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  price: integer("price").notNull(),
  province: text("province").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  nearbyPlaces: json<Record<string, `${number}m`>>("nearby_places"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorId: integer("author_id").references(() => users.id),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  postImage: text("post_image").notNull(),
  date: text("date").notNull(),
});

export const chats = sqliteTable("chats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  updatedAt: text("updated_at").notNull(),
});

// Chat participants (Many-to-Many)
export const chatParticipants = sqliteTable(
  "chat_participants",
  {
    chatId: integer("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.chatId, table.userId] })],
);

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: integer("chat_id")
    .notNull()
    .references(() => chats.id),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id),
  text: text("text").notNull(),
  createdAt: text("created_at").notNull(),
});

// Bookmarks (Many-to-Many)
export const bookmarks = sqliteTable(
  "bookmarks",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.propertyId] })],
);
