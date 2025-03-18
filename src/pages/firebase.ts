// firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCQjboNcC2oxfY9eZYyZSUyvzxNI3S_5mE",

  authDomain: "onlinelearningplatform-4a112.firebaseapp.com",

  databaseURL: "https://onlinelearningplatform-4a112-default-rtdb.firebaseio.com",

  projectId: "onlinelearningplatform-4a112",

  storageBucket: "onlinelearningplatform-4a112.firebasestorage.app",

  messagingSenderId: "21116178423",

  appId: "1:21116178423:web:feee278e8edb71f9dee8f2",

  measurementId: "G-HHTV9V16M9"

 };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
