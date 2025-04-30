import React, { useState, useEffect } from "react";
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './Recommendations.css'; // Ensure this file is imported
import { Mic, MicOff } from 'lucide-react';

const Recommendations = () => {
    const [mood, setMood] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [listening, setListening] = useState(false);

    const {
        transcript,
        resetTranscript,
        listening: isListening,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setMood(transcript);
        }
    }, [transcript]);

    const getRecommendations = async () => {
        setError(null);
        setResult(null);
        try {
            const response = await axios.post('http://localhost:8000/recommend', {
                user_mood: mood || transcript,
            });
            setResult(response.data);
        } catch (err) {
            setError("❌ Could not fetch recommendations. Please try again.");
            console.error(err);
        }
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

    const renderLinkList = (items) =>
        items.map((item, i) => {
            const match = item.match(/\[(.*?)\]\((https?:\/\/.*?)\)/);
            if (match) {
                const [, title, url] = match;
                return (
                    <li key={i}>
                        <a href={url} target="_blank" rel="noopener noreferrer">{title}</a>
                    </li>
                );
            }
            const [title, rawUrl] = item.split(': ');
            const url = rawUrl?.trim().replace(/[<>]/g, '');
            return (
                <li key={i}>
                    <a href={url} target="_blank" rel="noopener noreferrer">{title}</a>
                </li>
            );
        });

    const renderProduct = (product) => {
        if (!product || !product.includes('http')) return <p>{product}</p>;
        const lastColonIndex = product.lastIndexOf(':');
        const title = product.substring(0, lastColonIndex).trim();
        const url = product.substring(lastColonIndex + 1).trim();
        return (
            <p>
                <a href={url} target="_blank" rel="noopener noreferrer">{title}</a>
            </p>
        );
    };

    return (
        <div className="ai-chat-fullscreen">
            <div className="ai-chat-header">
                <span>Personalized Recommendations</span>
            </div>

            <div className="ai-chat-messages">
                {result && !result.error && (
                    <div>
                        <h3>🎥 YouTube Videos</h3>
                        <ol>{renderLinkList(result.videos || [])}</ol>

                        <h3>📰 Articles</h3>
                        <ol>{renderLinkList(result.articles || [])}</ol>

                        <h3>🛍️ Self-Care Product</h3>
                        {renderProduct(result.product)}
                    </div>
                )}
            </div>

            <div className="ai-chat-input">
                <textarea
                    value={mood || transcript}
                    onChange={(e) => {
                        setMood(e.target.value);
                        resetTranscript();
                    }}
                    placeholder="How are you feeling today?"
                />
                <button onClick={getRecommendations}>Get Help</button>
                <button onClick={handleMicClick} title="Speak your mood" className="mic-button">
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
            </div>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {listening && <p style={{ color: 'green' }}>Listening...</p>}
        </div>
    );
};

export default Recommendations;
