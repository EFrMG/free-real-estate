export interface UserData {
  id: number;
  email: string;
  name: string;
  profilePicture?: string;
}

export interface PropertyData {
  id: number;
  userId?: number;
  type: "buy" | "rent";
  title: string;
  description: string;
  longDescription?: string;
  exteriorImage: string;
  interiorGallery?: string[];
  sizes?: number[];
  bedrooms: number;
  bathrooms: number;
  price: number;
  province: string;
  city: string;
  address: string;
  nearbyPlaces?: Record<string, `${number}m`>;
  latitude: number;
  longitude: number;
}

export interface PostData {
  id: number;
  authorId?: number;
  title: string;
  excerpt: string;
  content: string;
  postImage: string;
  date: string;
}

// Used for the Property Item page
export interface PropertyWithAuthor extends PropertyData {
  author: UserData;
}

// Used for User Profile pages
export interface UserWithProperties extends UserData {
  properties: PropertyData[];
  bookmarks: PropertyData[];
}

// Used for the Blog section
export interface PostWithAuthor extends PostData {
  author: UserData;
}

// Join table
export interface Bookmarks {
  propertyIds: number[];
}

export interface Chat {
  id: number;
  participants: UserData[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  text: string;
  createdAt: string;
}
