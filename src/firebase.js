// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 Add this

const firebaseConfig = {
  apiKey: "AIzaSyA2E84OToDh0S6mZWvDQFoxQmRgNkVH_34",
  authDomain: "zerowaste-ae81a.firebaseapp.com",
  projectId: "zerowaste-ae81a",
  storageBucket: "zerowaste-ae81a.appspot.com",
  messagingSenderId: "953126903334",
  appId: "1:953126903334:web:88b4e66c9a6b2b6e8e10e7",
  measurementId: "G-XH5QX2SCRV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // 👈 Export Firestore
