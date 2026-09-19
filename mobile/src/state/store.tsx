import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AppState, Author, Comment, Flare, FlareType, JournalEntry, NotificationItem, Preferences, Profile, Room, TimeCapsule,
} from './types';
import { publisherAuthors, seedFlares, seedRooms, USER_ID } from '../data/seed';

const STATE_KEY = 'heatt-state-v1';

const userAuthor: Author = {
  id: USER_ID,
  name: 'You',
  handle: 'you',
  initials: 'Y',
  accent: 'user',
  bio: 'A private, local profile until you sign in.',
};

const defaultState: AppState = {
  onboarded: false,
  signedIn: false,
  profile: { name: 'Reader', handle: 'reader', bio: 'Here to read closely and write honestly.' },
  preferences: {
    topics: ['Creative practice', 'Books & ideas', 'Philosophy', 'Poetry & language'],
    intent: 'Explore',
    textSize: 'M',
    readingFont: 'serif',
    quietMode: false,
    haptics: true,
  },
  flares: [],
  comments: [],
  reactions: {},
  saved: [],
  reposts: [],
  following: [],
  rooms: [],
  joinedRooms: [],
  journal: [],
  capsules: [],
  notifications: [],
  exploredShelves: [],
};

function reviveState(parsed: Partial<AppState> | null): AppState {
  if (!parsed) return defaultState;
  return {
    ...defaultState,
    ...parsed,
    profile: { ...defaultState.profile, ...(parsed.profile ?? {}) },
    preferences: { ...defaultState.preferences, ...(parsed.preferences ?? {}) },
    flares: parsed.flares ?? [],
    comments: parsed.comments ?? [],
    reactions: parsed.reactions ?? {},
    saved: parsed.saved ?? [],
    reposts: parsed.reposts ?? [],
    following: parsed.following ?? [],
    rooms: parsed.rooms ?? [],
    joinedRooms: parsed.joinedRooms ?? [],
    journal: parsed.journal ?? [],
    capsules: parsed.capsules ?? [],
    notifications: parsed.notifications ?? [],
    exploredShelves: parsed.exploredShelves ?? [],
  };
}

type StoreValue = {
  state: AppState;
  ready: boolean;
  authors: Record<string, Author>;
  allRooms: Room[];
  // derived
  allFlares: Flare[];
  authorFor: (id: string) => Author;
  // actions
  setOnboarded: (v: boolean) => void;
  signIn: (name?: string) => void;
  signOut: () => void;
  updateProfile: (p: Partial<Profile>) => void;
  updatePreferences: (p: Partial<Preferences>) => void;
  setHeat: (flareId: string, intensity: number) => void;
  toggleSave: (flareId: string) => void;
  toggleRepost: (flareId: string) => void;
  toggleFollow: (authorId: string) => void;
  addFlare: (input: { type: FlareType; topic: string; text: string; title?: string; room?: string; invitation?: Flare['invitation']; tags?: string[] }) => Flare;
  deleteFlare: (id: string) => void;
  addComment: (flareId: string, text: string) => void;
  addJournal: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  deleteJournal: (id: string) => void;
  addCapsule: (content: string, revealAt: number) => void;
  openCapsule: (id: string) => void;
  createRoom: (input: { name: string; description: string; topic: string; privacy: 'public' | 'private' }) => Room;
  joinRoom: (id: string) => void;
  leaveRoom: (id: string) => void;
  joinRoomByCode: (code: string) => Room | null;
  addMemberToRoom: (roomId: string, handle: string) => boolean;
  markShelfExplored: (category: string) => void;
  markNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  exportData: () => string;
  resetLocalData: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

let idCounter = 0;
function uid(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STATE_KEY);
        if (raw) setState(reviveState(JSON.parse(raw)));
      } catch {
        // ignore, use defaults
      } finally {
        hydrated.current = true;
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STATE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const authors = useMemo(() => {
    const map: Record<string, Author> = { [USER_ID]: { ...userAuthor } };
    for (const a of publisherAuthors) map[a.id] = a;
    return map;
  }, []);

  const authorFor = useCallback(
    (id: string): Author => {
      if (id === USER_ID) {
        return {
          ...userAuthor,
          name: state.profile.name,
          handle: state.profile.handle,
          bio: state.profile.bio,
          initials: state.profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'Y',
          avatarData: state.profile.avatarData,
        } as Author & { avatarData?: string };
      }
      return authors[id] ?? { ...userAuthor, id, name: 'Unknown', handle: 'unknown', initials: '?' };
    },
    [authors, state.profile],
  );

  const allFlares = useMemo(() => {
    // user flares first (newest), then seed catalog
    return [...state.flares, ...seedFlares].sort((a, b) => b.createdAt - a.createdAt);
  }, [state.flares]);

  const allRooms = useMemo(() => {
    return [...state.rooms, ...seedRooms];
  }, [state.rooms]);

  const patch = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);

  const value = useMemo<StoreValue>(() => ({
    state,
    ready,
    authors,
    allRooms,
    allFlares,
    authorFor,
    setOnboarded: (v) => patch((s) => ({ ...s, onboarded: v })),
    signIn: (name) => patch((s) => ({ ...s, signedIn: true, profile: name ? { ...s.profile, name } : s.profile })),
    signOut: () => patch((s) => ({ ...s, signedIn: false })),
    updateProfile: (p) => patch((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    updatePreferences: (p) => patch((s) => ({ ...s, preferences: { ...s.preferences, ...p } })),
    setHeat: (flareId, intensity) =>
      patch((s) => {
        const current = s.reactions[flareId] ?? 0;
        const next = { ...s.reactions };
        if (intensity <= 0 || intensity === current) delete next[flareId];
        else next[flareId] = Math.min(3, Math.max(1, intensity));
        return { ...s, reactions: next };
      }),
    toggleSave: (flareId) =>
      patch((s) => ({
        ...s,
        saved: s.saved.includes(flareId) ? s.saved.filter((x) => x !== flareId) : [flareId, ...s.saved],
      })),
    toggleRepost: (flareId) =>
      patch((s) => ({
        ...s,
        reposts: s.reposts.includes(flareId) ? s.reposts.filter((x) => x !== flareId) : [flareId, ...s.reposts],
      })),
    toggleFollow: (authorId) =>
      patch((s) => ({
        ...s,
        following: s.following.includes(authorId)
          ? s.following.filter((x) => x !== authorId)
          : [authorId, ...s.following],
      })),
    addFlare: (input) => {
      const flare: Flare = {
        id: uid('flare'),
        authorId: USER_ID,
        type: input.type,
        topic: input.topic,
        title: input.title,
        text: input.text,
        createdAt: Date.now(),
        room: input.room,
        invitation: input.invitation,
        tags: input.tags,
      };
      patch((s) => ({ ...s, flares: [flare, ...s.flares] }));
      return flare;
    },
    deleteFlare: (id) =>
      patch((s) => ({
        ...s,
        flares: s.flares.filter((f) => f.id !== id),
        comments: s.comments.filter((c) => c.flareId !== id),
      })),
    addComment: (flareId, text) =>
      patch((s) => ({
        ...s,
        comments: [
          ...s.comments,
          { id: uid('c'), flareId, authorId: USER_ID, text, createdAt: Date.now() },
        ],
      })),
    addJournal: (entry) =>
      patch((s) => ({
        ...s,
        journal: [{ ...entry, id: uid('j'), createdAt: Date.now() }, ...s.journal],
      })),
    deleteJournal: (id) => patch((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== id) })),
    addCapsule: (content, revealAt) =>
      patch((s) => ({
        ...s,
        capsules: [{ id: uid('cap'), content, createdAt: Date.now(), revealAt }, ...s.capsules],
      })),
    openCapsule: (id) =>
      patch((s) => ({
        ...s,
        capsules: s.capsules.map((c) => (c.id === id ? { ...c, openedAt: Date.now() } : c)),
      })),
    createRoom: (input) => {
      const room: Room = {
        id: uid('room'),
        name: input.name,
        description: input.description,
        topic: input.topic,
        privacy: input.privacy,
        ownerId: USER_ID,
        members: [USER_ID],
        inviteCode: makeInviteCode(),
        createdAt: Date.now(),
        createdByUser: true,
      };
      patch((s) => ({ ...s, rooms: [room, ...s.rooms], joinedRooms: [room.id, ...s.joinedRooms] }));
      return room;
    },
    joinRoom: (id) =>
      patch((s) => ({ ...s, joinedRooms: s.joinedRooms.includes(id) ? s.joinedRooms : [id, ...s.joinedRooms] })),
    leaveRoom: (id) => patch((s) => ({ ...s, joinedRooms: s.joinedRooms.filter((r) => r !== id) })),
    joinRoomByCode: (code) => {
      const clean = code.trim().toUpperCase();
      const found = [...state.rooms, ...seedRooms].find((r) => r.inviteCode === clean);
      if (found) {
        patch((s) => ({ ...s, joinedRooms: s.joinedRooms.includes(found.id) ? s.joinedRooms : [found.id, ...s.joinedRooms] }));
        return found;
      }
      return null;
    },
    addMemberToRoom: (roomId, handle) => {
      const clean = handle.trim().replace(/^@/, '');
      if (!clean) return false;
      patch((s) => ({
        ...s,
        rooms: s.rooms.map((r) =>
          r.id === roomId && !r.members.includes(clean) ? { ...r, members: [...r.members, clean] } : r,
        ),
      }));
      return true;
    },
    markShelfExplored: (category) =>
      patch((s) => (s.exploredShelves.includes(category) ? s : { ...s, exploredShelves: [...s.exploredShelves, category] })),
    markNotificationsRead: () =>
      patch((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    dismissNotification: (id) =>
      patch((s) => ({ ...s, notifications: s.notifications.filter((n) => n.id !== id) })),
    exportData: () => JSON.stringify(state, null, 2),
    resetLocalData: () => {
      AsyncStorage.removeItem(STATE_KEY).catch(() => {});
      setState(defaultState);
    },
  }), [state, ready, authors, allRooms, allFlares, authorFor, patch]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
