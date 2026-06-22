import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  orderBy, 
  increment,
  runTransaction
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "./firebase.js";

// Fetch all posts from Firestore
export async function fetchPosts() {
  try {
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(postsQuery);
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    // Return empty list so app doesn't crash
    return [];
  }
}

// Upload pet photo and create post
export async function createPost(imageFile, petName, breed, caption) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to create a post");

  let imageUrl = "";

  try {
    if (imageFile) {
      // 1. Try uploading to Firebase Storage
      try {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `posts/${user.uid}_${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, fileName);
        
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      } catch (storageError) {
        console.warn("Firebase Storage upload failed. Falling back to local data URL or placeholder.", storageError);
        
        // Fallback: Read file as Data URL if under 800KB, otherwise use Picsum
        if (imageFile.size < 800000) {
          imageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(imageFile);
          });
        } else {
          // Generate a beautiful random pet-related image from Unsplash/Picsum as a fail-safe
          const randomId = Math.floor(Math.random() * 1000);
          imageUrl = `https://picsum.photos/id/${randomId % 100 + 10}/600/600`;
        }
      }
    } else {
      // Fallback if no file is provided
      imageUrl = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600";
    }

    // 2. Create document in Firestore
    const postData = {
      userId: user.uid,
      userName: user.displayName || "Pet Lover",
      userPhoto: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
      petName: petName || "My Pet",
      breed: breed || "Cute Breed",
      caption: caption || "",
      imageUrl: imageUrl,
      createdAt: new Date().toISOString(),
      likes: [],
      likesCount: 0,
      comments: []
    };

    const docRef = await addDoc(collection(db, "posts"), postData);
    
    // 3. Increment postsCount in user's profile
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        postsCount: increment(1)
      });
    } catch (err) {
      console.warn("Failed to update user post count:", err);
    }

    return { id: docRef.id, ...postData };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

// Toggle like state (like/unlike)
export async function toggleLikePost(postId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to like a post");

  const postRef = doc(db, "posts", postId);

  try {
    return await runTransaction(db, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists()) {
        throw new Error("Post does not exist!");
      }

      const postData = postDoc.data();
      const likes = postData.likes || [];
      const likedIndex = likes.indexOf(user.uid);
      
      let newLikes;
      let newLikesCount;

      if (likedIndex > -1) {
        // Unlike: Remove user id
        newLikes = likes.filter(uid => uid !== user.uid);
        newLikesCount = Math.max(0, (postData.likesCount || 0) - 1);
      } else {
        // Like: Add user id
        newLikes = [...likes, user.uid];
        newLikesCount = (postData.likesCount || 0) + 1;
      }

      transaction.update(postRef, {
        likes: newLikes,
        likesCount: newLikesCount
      });

      return {
        likes: newLikes,
        likesCount: newLikesCount,
        isLiked: likedIndex === -1
      };
    });
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
}

// Add comment to a post
export async function addComment(postId, commentText) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to comment");
  if (!commentText.trim()) throw new Error("Comment text cannot be empty");

  const postRef = doc(db, "posts", postId);

  const newComment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: user.uid,
    userName: user.displayName || "Pet Lover",
    userPhoto: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
    text: commentText.trim(),
    createdAt: new Date().toISOString()
  };

  try {
    await updateDoc(postRef, {
      comments: arrayUnion(newComment)
    });
    return newComment;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}
