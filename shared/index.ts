import { type InferSelectModel } from "drizzle-orm";
import * as schema from "./src/schema.ts";

// Re-export the schema for the backend
export * from "./src/schema.ts";

// Nullable fields optional so the frontend can omit fields that are null in the DB (T?)
// Otherwise, one needs to write explicit "null" in the data
type OptionalNullable<T> = {
  [K in keyof T as null extends T[K] ? K : never]?: T[K];
} & {
  [K in keyof T as null extends T[K] ? never : K]: T[K];
};

// Inferred from Schema
export type UserData = OptionalNullable<InferSelectModel<typeof schema.users>>;

export type PropertyData = OptionalNullable<
  InferSelectModel<typeof schema.properties>
>;

export type PostData = OptionalNullable<InferSelectModel<typeof schema.posts>>;

export type ChatData = OptionalNullable<InferSelectModel<typeof schema.chats>>;

export type MessageData = OptionalNullable<
  InferSelectModel<typeof schema.messages>
>;

// Extended Types (Used for UI and specific API responses)
// Property Item page
export interface PropertyWithAuthor extends PropertyData {
  author: UserData;
}

// User Profile pages
export interface UserWithPropertiesBookmarks extends UserData {
  properties: PropertyData[];
  bookmarks: PropertyData[];
}

// Blog section
export interface PostWithAuthor extends PostData {
  author: UserData;
}

// Join table representation
export interface Bookmarks {
  propertyIds: number[];
}

// Chat with nested participants and last message
export interface Chat extends ChatData {
  participants: UserData[];
  lastMessage?: MessageData;
}
