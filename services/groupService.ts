import { db } from '@/src/config/firebase';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { clearAllGroupLocations } from '@/services/locationService';

export interface Member {
  uid: string;
  username: string;
  avatarBase64: string | null;
  tracking: boolean;
  joinedAt: number;
}

export interface GroupData {
  id: string;
  code: string;
  leaderUid: string;
  members: Member[];
  createdAt: number;
}

async function generateUniqueCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 100) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const q = query(collection(db, 'groups'), where('code', '==', code), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return code;
    attempts++;
  }
  throw new Error('Could not generate unique code');
}

export async function createGroup(input: {
  leaderUid: string;
  leaderUsername: string;
  leaderAvatarBase64: string | null;
}) {
  const code = await generateUniqueCode();
  const groupRef = doc(collection(db, 'groups'));

  const group = {
    code,
    leaderUid: input.leaderUid,
    members: [
      {
        uid: input.leaderUid,
        username: input.leaderUsername,
        avatarBase64: input.leaderAvatarBase64,
        tracking: false,
        joinedAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  };

  await setDoc(groupRef, group);
  return { ...group, id: groupRef.id } as GroupData;
}

export async function joinGroup(
  code: string,
  user: { uid: string; username: string; avatarBase64: string | null }
) {
  const q = query(collection(db, 'groups'), where('code', '==', code), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error('Invalid group code');

  const groupDoc = snap.docs[0];
  const groupData = groupDoc.data();

  const isAlreadyMember = groupData.members.some(
    (m: Member) => m.uid === user.uid
  );
  if (isAlreadyMember) throw new Error('You are already a member of this group');

  const member: Member = {
    uid: user.uid,
    username: user.username,
    avatarBase64: user.avatarBase64,
    tracking: false,
    joinedAt: Date.now(),
  };

  await updateDoc(groupDoc.ref, {
    members: arrayUnion(member),
  });

  const updatedMembers = [...groupData.members, member];
  return { ...groupData, members: updatedMembers, id: groupDoc.id } as GroupData;
}

export async function leaveGroup(groupId: string, uid: string) {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) throw new Error('Group not found');

  const member = groupSnap
    .data()
    .members.find((m: Member) => m.uid === uid);
  if (!member) throw new Error('You are not a member of this group');

  await updateDoc(groupRef, {
    members: arrayRemove(member),
  });
}

export async function deleteGroup(groupId: string, uid: string) {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) throw new Error('Group not found');

  const data = groupSnap.data();
  if (data.leaderUid !== uid) throw new Error('Only the group leader can delete the group');

  const memberUids = data.members.map((m: Member) => m.uid);

  await deleteDoc(groupRef);

  const promises = memberUids.map((memberUid: string) =>
    updateDoc(doc(db, 'users', memberUid), { currentGroup: null })
  );
  promises.push(clearAllGroupLocations(groupId));
  await Promise.all(promises);
}

export async function updateMemberTracking(
  groupId: string,
  uid: string,
  tracking: boolean
) {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) return;

  const members = groupSnap.data().members.map((m: Member) =>
    m.uid === uid ? { ...m, tracking } : m
  );

  await updateDoc(groupRef, { members });
}

export function subscribeToGroup(
  groupId: string,
  onData: (data: GroupData | null) => void,
  onError: (err: Error) => void
) {
  const unsub = onSnapshot(
    doc(db, 'groups', groupId),
    (snap) => {
      if (snap.exists()) {
        onData({ ...snap.data(), id: snap.id } as GroupData);
      } else {
        onData(null);
      }
    },
    onError
  );
  return unsub;
}
