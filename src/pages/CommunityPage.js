// src/pages/CommunityPage.js
import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { ref, onChildAdded, push } from "firebase/database";

const CommunityPage = () => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const chatRef = ref(db, "chat");
    onChildAdded(chatRef, (snapshot) => {
      setMessages((prev) => [...prev, snapshot.val()]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    const chatRef = ref(db, "chat");
    await push(chatRef, {
      text: msg,
      created: Date.now(),
    });
    setMsg('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Community Support</h2>
      <div className="h-64 overflow-y-scroll border p-2 mb-2 bg-gray-100 rounded">
        {messages.map((m, i) => (
          <div key={i} className="mb-1">{m.text}</div>
        ))}
        <div ref={messagesEndRef} />
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
