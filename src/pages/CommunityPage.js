import React, { useEffect, useState, useRef } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDKQIWCsslDoCn_T2aeW0-NVh5cYOe5FfM",
  authDomain: "safheavn.firebaseapp.com",
  databaseURL: "https://safheavn-default-rtdb.firebaseio.com",
  projectId: "safheavn",
  storageBucket: "safheavn.appspot.com", // ✅ Corrected
  messagingSenderId: "119521366811",
  appId: "1:119521366811:web:a799795ba7abcbcc53b9be",
  measurementId: "G-NPRDP76XGR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CommunityPage = () => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const messagesEndRef = useRef(null);  // Correct usage of useRef

  useEffect(() => {
    const q = query(collection(db, "chat"), orderBy("created", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const newMsgs = snapshot.docs.map(doc => doc.data());
      setMessages(newMsgs);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    await addDoc(collection(db, "chat"), { text: msg, created: serverTimestamp() });
    setMsg('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Community Support</h2>
      <div className="h-64 overflow-y-scroll border p-2 mb-2 bg-gray-100 rounded">
        {messages.map((m, i) => <div key={i} className="mb-1">{m.text}</div>)}
        <div ref={messagesEndRef} />  {/* Scroll target */}
      </div>
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Type your message..."
      />
      <button
        onClick={sendMessage}
        className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Send
      </button>
    </div>
  );
};

export default CommunityPage;
