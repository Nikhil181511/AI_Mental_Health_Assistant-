// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyC0DsArPE8kZEZwkN-1JJue-3AtAAlOcss",
    authDomain: "goaxplora.firebaseapp.com",
    projectId: "goaxplora",
    databaseURL: "https://goaxplora-default-rtdb.firebaseio.com/",
    storageBucket: "goaxplora.firebasestorage.app",
    messagingSenderId: "300711991151",
    appId: "1:300711991151:web:6bc24bcb2f3fcbbb037a9a",
    measurementId: "G-WN4K0F0RKJ"

};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getDatabase(app);
