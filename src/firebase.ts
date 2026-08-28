import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAs-jW97657QYkFxnrx-w_UoHidxTyBsAA",
  authDomain: "website-e8b0a.firebaseapp.com",
  projectId: "website-e8b0a",
  storageBucket: "website-e8b0a.firebasestorage.app",
  messagingSenderId: "811913664778",
  appId: "1:811913664778:web:c89357bacfefd9d31b42f3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const documentDownloadUrl =
  "https://us-central1-website-e8b0a.cloudfunctions.net/downloadDocument";
