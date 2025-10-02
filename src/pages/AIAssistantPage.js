import React, { useState, useEffect } from "react";
import './chat.css';
import { Brain, Mic, MicOff } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const AIAssistantPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [listening, setListening] = useState(false);

    const {
        transcript,
        resetTranscript,
        listening: isListening,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages(prev => [...prev, userMessage]);

        // Prepare last 5 messages as history
        const history = [...messages, userMessage].slice(-5);

        try {
            const response = await fetch("https://mh-backend-8w1j.onrender.com/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input, history }),
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
        resetTranscript();
    };

    const handleMicClick = () => {
        if (!browserSupportsSpeechRecognition) {
            alert("Speech recognition not supported in your browser.");
            return;
        }

        if (isListening) {
            SpeechRecognition.stopListening();
            setListening(false);
        } else {
            SpeechRecognition.startListening({ continuous: false, language: 'en-IN' });
            setListening(true);
        }
    };

    return (
      <>
        <div className="ai-chat-fullscreen">
            <div className="ai-chat-header">
                <Brain size={42} className="icon" />
                <span> AI Assistant</span>
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
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                    placeholder="How are you feeling today?"
                />
                <button onClick={sendMessage}>Send</button>
                <button onClick={handleMicClick} title="Speak your mood" className="mic-button">
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
            </div>
        </div>
      </>
    );
};

export default AIAssistantPage;
