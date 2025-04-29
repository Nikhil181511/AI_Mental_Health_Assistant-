import React, { useState } from 'react';
import axios from 'axios';
const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const res = await axios.post('http://localhost:8000/assistant', { message: input });
    setMessages([...messages, { user: input, bot: res.data.reply }]);
    setInput('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl">MindWell Assistant</h2>
      <div className="my-4 h-64 overflow-y-scroll border p-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <p><strong>You:</strong> {msg.user}</p>
            <p><strong>Bot:</strong> {msg.bot}</p>
          </div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} className="w-full p-2 border" />
      <button onClick={sendMessage} className="mt-2 bg-green-500 text-white px-4 py-1">Send</button>
    </div>
  );
};
export default AIAssistantPage;
