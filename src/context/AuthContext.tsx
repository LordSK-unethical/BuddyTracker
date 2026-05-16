import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  onAuthStateChanged,
  User,
  signInAnonymously,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, db } from '@/src/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface UserData {
  username: string;
  avatarUrl: string | null;
  avatarBase64: string | null;
  currentGroup: string | null;
  tracking: boolean;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  completeOnboarding: (username: string, avatarUri: string | null) => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  updateCurrentGroup: (groupId: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const hasSignedIn = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading && !user && !hasSignedIn.current) {
      hasSignedIn.current = true;
      signInAnonymously(auth).catch((err) => {
        console.error('Anonymous sign-in failed:', err);
      });
    }
  }, [loading, user]);

  const completeOnboarding = async (username: string, avatarUri: string | null) => {
    if (!user) throw new Error('No authenticated user');

    let avatarUrl: string | null = null;
    let avatarBase64: string | null = null;
    if (avatarUri) {
      const result = await manipulateAsync(
        avatarUri,
        [{ resize: { width: 256 } }],
        { compress: 0.7, format: SaveFormat.JPEG, base64: true }
      );
      avatarBase64 = result.base64 ?? null;
      avatarUrl = result.uri;
    }

    const userDoc: UserData = {
      username,
      avatarUrl,
      avatarBase64,
      currentGroup: null,
      tracking: false,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'usernames', username.toLowerCase()), { uid: user.uid });
    await setDoc(doc(db, 'users', user.uid), userDoc);
    setUserData(userDoc);
  };

  const checkUsername = async (username: string): Promise<boolean> => {
    const docRef = doc(db, 'usernames', username.toLowerCase());
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  };

  const updateCurrentGroup = async (groupId: string | null) => {
    if (!user) throw new Error('No authenticated user');
    await updateDoc(doc(db, 'users', user.uid), { currentGroup: groupId });
    setUserData((prev) => (prev ? { ...prev, currentGroup: groupId } : prev));
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, signOut, completeOnboarding, checkUsername, updateCurrentGroup }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
