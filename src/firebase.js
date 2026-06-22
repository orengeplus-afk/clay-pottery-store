import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCIEpnQ0yNOl9Vady-YkuLD42H1tnKDjX4",
  authDomain: "pet-stat-gram.firebaseapp.com",
  projectId: "pet-stat-gram",
  storageBucket: "pet-stat-gram.firebasestorage.app",
  messagingSenderId: "656459132932",
  appId: "1:656459132932:web:322657dfc26368a982c551",
  measurementId: "G-ZBDPH7PDZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
