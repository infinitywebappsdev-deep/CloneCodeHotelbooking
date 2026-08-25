import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../../firebase-applet-config.json";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
