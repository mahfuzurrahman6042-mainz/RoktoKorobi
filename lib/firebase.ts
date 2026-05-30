import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { getDatabase, Database, ref, set, get, update, onValue, push, remove } from 'firebase/database';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;
let messaging: Messaging | null = null;

if (typeof window !== 'undefined') {
  try {
    // Check if Firebase is properly configured
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      auth = getAuth(app);
      database = getDatabase(app);
      
      if ('serviceWorker' in navigator) {
        try {
          messaging = getMessaging(app);
        } catch (error) {
          console.log('Messaging not supported in this environment');
        }
      }
    } else {
      console.log('Firebase not configured - using demo mode');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Auth helper functions
export const loginUser = async (email: string, password: string) => {
  if (!auth) throw new Error('Auth not initialized');
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (email: string, password: string) => {
  if (!auth) throw new Error('Auth not initialized');
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  if (!auth) throw new Error('Auth not initialized');
  return signOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth?.currentUser || null;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// Database helper functions
export const saveUserData = async (userId: string, data: any) => {
  if (!database) throw new Error('Database not initialized');
  const userRef = ref(database, `users/${userId}`);
  await set(userRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const getUserData = async (userId: string) => {
  if (!database) throw new Error('Database not initialized');
  const userRef = ref(database, `users/${userId}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const updateUserData = async (userId: string, data: any) => {
  if (!database) throw new Error('Database not initialized');
  const userRef = ref(database, `users/${userId}`);
  await update(userRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const listAllDonors = async () => {
  if (!database) throw new Error('Database not initialized');
  const donorsRef = ref(database, 'donors');
  const snapshot = await get(donorsRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export { app, auth, database, messaging, updateProfile, ref, set, get, update, onValue, push, remove };
