import { db } from '@/src/config/firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

export interface LocationData {
  groupId: string;
  uid: string;
  username: string;
  latitude: number;
  longitude: number;
  updatedAt: number;
}

function locationDocId(groupId: string, uid: string): string {
  return `${groupId}_${uid}`;
}

export async function updateLocation(
  groupId: string,
  uid: string,
  username: string,
  latitude: number,
  longitude: number
) {
  const ref = doc(db, 'locations', locationDocId(groupId, uid));
  await setDoc(ref, { groupId, uid, username, latitude, longitude, updatedAt: Date.now() });
}

export async function clearLocation(groupId: string, uid: string) {
  const ref = doc(db, 'locations', locationDocId(groupId, uid));
  await deleteDoc(ref).catch(() => {});
}

export function subscribeToGroupLocations(
  groupId: string,
  onData: (locations: LocationData[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'locations'), where('groupId', '==', groupId));
  return onSnapshot(
    q,
    (snap) => {
      const locations: LocationData[] = [];
      snap.forEach((d) => locations.push(d.data() as LocationData));
      onData(locations);
    },
    onError
  );
}

export async function clearAllGroupLocations(groupId: string) {
  const q = query(collection(db, 'locations'), where('groupId', '==', groupId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
