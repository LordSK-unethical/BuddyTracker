import { db } from '@/src/config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { GroupData } from '@/services/groupService';

export interface SyncSnapshot<T> {
  data: T | null;
  fromCache: boolean;
  hasPendingWrites: boolean;
}

export function subscribeToGroupDetailed(
  groupId: string,
  onNext: (snap: SyncSnapshot<GroupData>) => void,
  onError: (err: Error) => void
) {
  return onSnapshot(
    doc(db, 'groups', groupId),
    { includeMetadataChanges: true },
    (snap) => {
      onNext({
        data: snap.exists()
          ? ({ ...snap.data(), id: snap.id } as GroupData)
          : null,
        fromCache: snap.metadata.fromCache,
        hasPendingWrites: snap.metadata.hasPendingWrites,
      });
    },
    onError
  );
}

export function subscribeToUserProfile(
  uid: string,
  onNext: (data: { username: string; avatarBase64: string | null } | null) => void,
  onError: (err: Error) => void
) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        onNext({
          username: d.username ?? '',
          avatarBase64: d.avatarBase64 ?? null,
        });
      } else {
        onNext(null);
      }
    },
    onError
  );
}
