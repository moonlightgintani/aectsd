import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB988pHvlnpkPQgNiagset-6NIWozKJx5w",
  authDomain: "aectsd.firebaseapp.com",
  projectId: "aectsd",
  storageBucket: "aectsd.firebasestorage.app",
  messagingSenderId: "422813946016",
  appId: "1:422813946016:web:2a7f81736c0922c1f5b9c5",
  measurementId: "G-R348X0DSQK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
