import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDhd9Ig8chIHb5p8BSv1-M7N16_7gvyeDk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "xemphim-c8996.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "xemphim-c8996",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "xemphim-c8996.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "950932331829",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:950932331829:web:16506cca025f12f00d407c",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
