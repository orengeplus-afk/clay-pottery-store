import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";

// Register user and set up profile
export async function signUpUser(email, password, displayName, petName, petBreed) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name in Firebase Auth
    await updateProfile(user, {
      displayName: displayName,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(petName || displayName)}`
    });

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      displayName: displayName,
      petName: petName || "My Pet",
      petBreed: petBreed || "Happy Breed",
      bio: `Proud parent of ${petName || 'my adorable pet'}! 🐾`,
      createdAt: new Date().toISOString(),
      followersCount: 0,
      followingCount: 0,
      postsCount: 0
    });

    return user;
  } catch (error) {
    console.error("Sign up failed:", error);
    throw error;
  }
}

// Log in user
export async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Sign in failed:", error);
    throw error;
  }
}

// Log out user
export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out failed:", error);
    throw error;
  }
}

// Fetch user profile from Firestore
export async function getUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}
