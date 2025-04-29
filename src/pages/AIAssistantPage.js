import React, { useState } from "react";
import './chat.css';
import Navbar from './Navbar';
import { Brain } from 'lucide-react';

const AIAssistantPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input }),
            });

            const data = await response.json();
            const botMessage = {
                sender: "bot",
                text: typeof data.response === "string" ? data.response : JSON.stringify(data.response),
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot Error:", error);
        }

        setInput("");
    };

    return (
      <>
        <div className="ai-chat-fullscreen">
            <div className="ai-chat-header">
                <Brain size={32} className="icon" />
                <span>AI Assistant</span>
            </div>

            <div className="ai-chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`ai-chat-message ${msg.sender}`}>
                        {msg.text.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="ai-chat-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="How are you feeling today?"
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
        </>
    );  
};

export default AIAssistantPage;
