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

// Shape returned by GET /auth/me: the signed-in user's profile plus the header badge
export interface CurrentUser extends UserProfile {
  // Distinct people with messages this user hasn't read yet
  unreadSenders: number;
}

export type AgentProfileData = OptionalNullable<
  InferSelectModel<typeof schema.agentProfiles>
>;

export type PropertyData = OptionalNullable<
  InferSelectModel<typeof schema.properties>
>;

// A row of GET /properties: only what the listing cards and the map read, so the JSON columns and longDescription aren't decoded and re-encoded for every listing
export type PropertyListItem = Pick<
  PropertyData,
  | "id"
  | "transactionType"
  | "title"
  | "description"
  | "exteriorImage"
  | "province"
  | "city"
  | "address"
  | "bedrooms"
  | "bathrooms"
  | "price"
  | "latitude"
  | "longitude"
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

// One poll tick of the profile page, as returned by GET /chats/poll?chat=<id>
// `thread` is null when no chat was asked for or the user doesn't take part in it
export interface ChatPollData {
  chats: ChatSummary[];
  unreadSenders: number;
  thread: ChatThreadData | null;
}

// TODO: Blog section
// export type PostData = OptionalNullable<InferSelectModel<typeof schema.posts>>;
