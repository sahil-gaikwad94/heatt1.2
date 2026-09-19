export type FlareType = 'Thought' | 'Question' | 'Practice' | 'Poem' | 'Article';

export type Author = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  accent: string; // catalog accent or 'user'
  bio: string;
  isPublisher?: boolean;
  domain?: string;
};

export type Flare = {
  id: string;
  authorId: string;
  type: FlareType;
  topic: string;
  title?: string;
  text: string;
  createdAt: number;
  tags?: string[];
  room?: string;
  sourceUrl?: string; // provenance only — the app never redirects here
  sourceId?: string; // catalog id
  articleId?: string; // in-app article id (Article flares)
  invitation?: 'Advice welcome' | 'Just sharing' | 'Questions welcome';
  reposts?: number; // real count derived elsewhere; kept 0 for seeds
};

export type Comment = {
  id: string;
  flareId: string;
  authorId: string;
  text: string;
  createdAt: number;
};

export type JournalEntry = {
  id: string;
  source: string;
  quote: string;
  note: string;
  createdAt: number;
};

export type TimeCapsule = {
  id: string;
  content: string;
  createdAt: number;
  revealAt: number;
  openedAt?: number;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  topic: string;
  privacy: 'public' | 'private';
  ownerId: string;
  members: string[]; // author ids
  inviteCode: string;
  createdAt: number;
  createdByUser?: boolean;
};

export type Profile = {
  name: string;
  handle: string;
  bio: string;
  avatarData?: string;
};

export type Preferences = {
  topics: string[];
  intent: 'Reflect' | 'Learn' | 'Connect' | 'Explore';
  textSize: 'S' | 'M' | 'L';
  readingFont: 'serif' | 'sans' | 'hyperlegible';
  quietMode: boolean;
  haptics: boolean;
};

export type NotificationItem = {
  id: string;
  kind: 'reply' | 'helpful' | 'capsule' | 'room' | 'system';
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  flareId?: string;
};

export type AppState = {
  onboarded: boolean;
  signedIn: boolean;
  profile: Profile;
  preferences: Preferences;
  flares: Flare[]; // user-created flares only (seeds live in memory)
  comments: Comment[];
  // reactions: flareId -> intensity (1..3), 0/absent = none
  reactions: Record<string, number>;
  saved: string[]; // flare ids
  reposts: string[]; // flare ids the user reposted
  following: string[]; // author ids
  rooms: Room[]; // user-created rooms
  joinedRooms: string[]; // room ids (seeds + custom)
  journal: JournalEntry[];
  capsules: TimeCapsule[];
  notifications: NotificationItem[];
  exploredShelves: string[]; // categories opened at least once
};
