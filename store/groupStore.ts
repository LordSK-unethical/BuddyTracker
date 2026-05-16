import { create } from 'zustand';
import { Member } from '@/services/groupService';

export interface Notification {
  id: string;
  message: string;
  type: 'join' | 'leave' | 'delete' | 'update';
}

interface GroupState {
  groupId: string | null;
  groupCode: string | null;
  leaderUid: string | null;
  members: Member[];
  isSynced: boolean;
  isOnline: boolean;
  error: string | null;
  notifications: Notification[];

  setGroup: (id: string, code: string, leaderUid: string, members: Member[]) => void;
  updateMember: (uid: string, updates: Partial<Member>) => void;
  clearGroup: () => void;
  setSynced: (synced: boolean) => void;
  setOnline: (online: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (message: string, type: Notification['type']) => void;
  dismissNotification: (id: string) => void;
}

let notifCounter = 0;

export const useGroupStore = create<GroupState>((set, get) => ({
  groupId: null,
  groupCode: null,
  leaderUid: null,
  members: [],
  isSynced: false,
  isOnline: true,
  error: null,
  notifications: [],

  setGroup: (id, code, leaderUid, members) => {
    const prev = get();
    const wasInitialized = prev.members.length > 0;
    const prevUids = new Set(prev.members.map((m) => m.uid));
    const newUids = new Set(members.map((m) => m.uid));

    const newNotifs: Notification[] = [];

    if (wasInitialized) {
      const joined = members.filter((m) => !prevUids.has(m.uid));
      const left = prev.members.filter((m) => !newUids.has(m.uid));

      joined.forEach((m) => {
        newNotifs.push({
          id: `notif_${++notifCounter}`,
          message: `${m.username} joined the group`,
          type: 'join',
        });
      });
      left.forEach((m) => {
        newNotifs.push({
          id: `notif_${++notifCounter}`,
          message: `${m.username} left the group`,
          type: 'leave',
        });
      });

      const trackingChanged = members.filter((m) => {
        const old = prev.members.find((pm) => pm.uid === m.uid);
        return old && old.tracking !== m.tracking;
      });
      trackingChanged.forEach((m) => {
        newNotifs.push({
          id: `notif_${++notifCounter}`,
          message: m.tracking
            ? `${m.username} started sharing location`
            : `${m.username} stopped sharing location`,
          type: 'update',
        });
      });
    }

    set({
      groupId: id,
      groupCode: code,
      leaderUid,
      members,
      isSynced: true,
      error: null,
      notifications: [...prev.notifications, ...newNotifs],
    });
  },

  updateMember: (uid, updates) => {
    const { members } = get();
    const updated = members.map((m) => (m.uid === uid ? { ...m, ...updates } : m));
    set({ members: updated });
  },

  clearGroup: () => {
    set({
      groupId: null,
      groupCode: null,
      leaderUid: null,
      members: [],
      isSynced: false,
    });
  },

  setSynced: (synced) => set({ isSynced: synced }),
  setOnline: (online) => set({ isOnline: online }),
  setError: (error) => set({ error }),

  addNotification: (message, type) => {
    const notif: Notification = {
      id: `notif_${++notifCounter}`,
      message,
      type,
    };
    set((s) => ({ notifications: [...s.notifications, notif] }));
  },

  dismissNotification: (id) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  },
}));
