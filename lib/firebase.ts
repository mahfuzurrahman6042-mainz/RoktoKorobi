import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { getDatabase, Database, ref, set, get, update, onValue, push, remove } from 'firebase/database';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCnK13W_RIhqg8HwLFAnpLXtXcuHUlPZWA',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'roktokorobi-ea822.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://roktokorobi-ea822-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'roktokorobi-ea822',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'roktokorobi-ea822.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '837825810640',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:837825810640:web:6fdb6fff7c44b8f3788ed5'
};

console.log('Environment variables check:');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;
let messaging: Messaging | null = null;

// Initialize Firebase
const initializeFirebase = () => {
  try {
    // Check if Firebase is properly configured
    console.log('Firebase config:', firebaseConfig);
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
      console.log('Firebase initialized successfully');
    } else {
      console.log('Firebase not configured - missing API key or project ID');
      console.log('API Key:', firebaseConfig.apiKey);
      console.log('Project ID:', firebaseConfig.projectId);
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

if (typeof window !== 'undefined') {
  initializeFirebase();
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

export const listAllHospitals = async () => {
  if (!database) throw new Error('Database not initialized');
  const hospitalsRef = ref(database, 'hospitals');
  const snapshot = await get(hospitalsRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export { app, auth, database, messaging, updateProfile, ref, set, get, update, onValue, push, remove };
