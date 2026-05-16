import { initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from './env';

const firebaseConfig = {
  apiKey: ENV.apiKey,
  authDomain: ENV.authDomain,
  projectId: ENV.projectId,
  storageBucket: ENV.storageBucket,
  messagingSenderId: ENV.messagingSenderId,
  appId: ENV.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const { getReactNativePersistence } = require('@firebase/auth');

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
