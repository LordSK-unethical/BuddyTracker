import { useEffect, useRef } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useGroupStore } from '@/store/groupStore';
import { subscribeToGroupDetailed, subscribeToUserProfile } from '@/services/realtimeService';

export function useRealtimeSync() {
  const { userData } = useAuth();
  const groupId = userData?.currentGroup ?? null;
  const profileSubs = useRef<Map<string, () => void>>(new Map());

  function cleanupProfileSubs() {
    for (const [, unsub] of profileSubs.current) unsub();
    profileSubs.current.clear();
  }

  function syncProfileSubs(memberUids: string[]) {
    const subs = profileSubs.current;
    const uidSet = new Set(memberUids);

    for (const [uid, unsub] of subs) {
      if (!uidSet.has(uid)) {
        unsub();
        subs.delete(uid);
      }
    }

    for (const uid of memberUids) {
      if (subs.has(uid)) continue;

      const unsub = subscribeToUserProfile(
        uid,
        (profile) => {
          if (!profile) return;
          const store = useGroupStore.getState();
          const current = store.members.find((m) => m.uid === uid);
          if (
            current &&
            (current.username !== profile.username ||
              current.avatarBase64 !== profile.avatarBase64)
          ) {
            store.updateMember(uid, profile);
          }
        },
        (err) => console.error('Profile sub error', err)
      );
      subs.set(uid, unsub);
    }
  }

  useEffect(() => {
    if (!groupId) {
      cleanupProfileSubs();
      useGroupStore.getState().clearGroup();
      return;
    }

    useGroupStore.getState().setSynced(false);

    const unsubGroup = subscribeToGroupDetailed(
      groupId,
      (snap) => {
        useGroupStore.getState().setOnline(!snap.fromCache);

        if (snap.data) {
          useGroupStore.getState().setGroup(
            snap.data.id,
            snap.data.code,
            snap.data.leaderUid,
            snap.data.members
          );
          syncProfileSubs(snap.data.members.map((m) => m.uid));
        } else {
          useGroupStore.getState().addNotification('Group deleted by host', 'delete');
          cleanupProfileSubs();
          useGroupStore.getState().clearGroup();
        }
      },
      (err) => {
        useGroupStore.getState().setError(err.message);
      }
    );

    return () => {
      unsubGroup();
      cleanupProfileSubs();
    };
  }, [groupId]);
}
