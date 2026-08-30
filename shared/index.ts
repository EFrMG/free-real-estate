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
  biography?: string | null;
}

export type AgentProfileData = OptionalNullable<
  InferSelectModel<typeof schema.agentProfiles>
>;

export type PropertyData = OptionalNullable<
  InferSelectModel<typeof schema.properties>
>;

export type ChatData = OptionalNullable<InferSelectModel<typeof schema.chats>>;

export type ChatParticipantData = OptionalNullable<
  InferSelectModel<typeof schema.chatParticipants>
>;

export type MessageData = OptionalNullable<
  InferSelectModel<typeof schema.messages>
>;

export type RefreshTokenData = OptionalNullable<
  InferSelectModel<typeof schema.refreshTokens>
>;

// Extended Types (Used for UI and specific API responses)

// A conversation as returned by GET /chats
// Every chat is about one property and holds exactly two participants, so the counterpart is flattened into otherUser
export interface ChatSummary {
  id: number;
  updatedAt: string;
  // Messages from otherUser that arrived after this user's read watermark
  unreadCount: number;
  otherUser: Omit<UserBasic, "email">;
  property: Pick<PropertyData, "id" | "title" | "exteriorImage">;
  lastMessage: MessageData | null;
}

// A single conversation with its messages, as returned by GET /chats/:id/messages
export interface ChatThreadData extends ChatSummary {
  messages: MessageData[];
}

// TODO: Blog section
// export type PostData = OptionalNullable<InferSelectModel<typeof schema.posts>>;
