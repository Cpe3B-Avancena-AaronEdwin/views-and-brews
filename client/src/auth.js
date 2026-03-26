import { auth, db } from "./firebase";
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export async function loginUser(email, password) {
  await setPersistence(auth, browserSessionPersistence);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function registerCustomer(email, password, displayName) {
  await setPersistence(auth, browserSessionPersistence);

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    displayName,
    role: "customer",
    points: 0,
    favoriteProductIds: [],
    createdAt: serverTimestamp()
  });

  return user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) return snap.data().role;
  return null;
}