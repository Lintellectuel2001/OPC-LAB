import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function initializeAuth() {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('Anonymous auth successful:', userCredential.user.uid);
    return true;
  } catch (error) {
    console.error('Anonymous auth failed:', error);
    return false;
  }
}

export async function initializeFirestore() {
  try {
    await enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence enabled in first tab only.');
      } else if (err.code === 'unimplemented') {
        console.warn('Browser doesn\'t support persistence.');
      }
    });
    return true;
  } catch (error) {
    console.warn('Firestore persistence disabled:', error);
    return true;
  }
}