import React, { useState } from "react";
import './chat.css';

const AIAssistantPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input }),
            });

            const data = await response.json();

            const botMessage = {
                sender: "bot",
                text: typeof data.response === "string"
                    ? data.response
                    : JSON.stringify(data.response)
            };

            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Chatbot Error:", error);
        }

        setInput(""); // ✅ Clear input after sending
    };

    return (
        <div className="chatbot-container">
            <h3>Chat with AI 🤖</h3>

            <div className="chatbox">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender}>
                        {msg.text.split('\n').map((line, i) => (
                            <div key={i} style={{ marginLeft: '1em', textIndent: '-1em' }}>
                                {line}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How are you feeling today?"
            />
            <button className="next" onClick={sendMessage}>Send</button>
        </div>
    );
};

export default AIAssistantPage;
