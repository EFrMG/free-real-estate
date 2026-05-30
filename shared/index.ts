import { type InferSelectModel } from "drizzle-orm";
import * as schema from "./src/schema.ts";

// Re-export the schema for the backend
export * from "./src/schema.ts";

// Nullable fields optional so the frontend can omit fields that are null in the DB (K?)
// Otherwise, one needs to write explicit "null" in the data
type OptionalNullable<T> = {
  [K in keyof T as null extends T[K] ? K : never]?: T[K];
} & {
  [K in keyof T as null extends T[K] ? never : K]: T[K];
};

// Inferred from Schema and extensions
export type UserData = OptionalNullable<InferSelectModel<typeof schema.users>>;

export interface UserBasic extends Omit<UserData, "passwordHash"> {}

// Shape returned by GET /users/:id
export interface UserProfile extends UserBasic {
  licenseNumber?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
}

export type AgentProfileData = OptionalNullable<
  InferSelectModel<typeof schema.agentProfiles>
>;

export type PropertyData = OptionalNullable<
  InferSelectModel<typeof schema.properties>
>;

export type ChatData = OptionalNullable<InferSelectModel<typeof schema.chats>>;

export type MessageData = OptionalNullable<
  InferSelectModel<typeof schema.messages>
>;

// TODO: Blog section
// export type PostData = OptionalNullable<InferSelectModel<typeof schema.posts>>;

// Extended Types (Used for UI and specific API responses)
// Chat with nested participants and last message
export interface Chat extends ChatData {
  participants: UserData[];
  lastMessage?: MessageData;
}
