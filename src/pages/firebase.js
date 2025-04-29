// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDKQIWCsslDoCn_T2aeW0-NVh5cYOe5FfM",
    authDomain: "safheavn.firebaseapp.com",
    databaseURL: "https://safheavn-default-rtdb.firebaseio.com",
    projectId: "safheavn",
    storageBucket: "safheavn.firebasestorage.app",
    messagingSenderId: "119521366811",
    appId: "1:119521366811:web:a799795ba7abcbcc53b9be",
    measurementId: "G-NPRDP76XGR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
