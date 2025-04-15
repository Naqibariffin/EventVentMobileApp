import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
    apiKey: "AIzaSyA0NJU1hBUkgyt-pUnoPj8JUECuAxQZc3E",
  authDomain: "eventvent-f26d4.firebaseapp.com",
  projectId: "eventvent-f26d4",
  storageBucket: "eventvent-f26d4.firebasestorage.app",
  messagingSenderId: "626964702650",
  appId: "1:626964702650:web:77bfca0884e5ce2851a983",
  measurementId: "G-2MCJDPS2EG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth,storage };

