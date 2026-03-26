import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export async function loginUser(email, password) {
  await setPersistence(auth, browserSessionPersistence);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) return snap.data().role;
  return null;
}