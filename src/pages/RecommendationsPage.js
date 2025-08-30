import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './Recommendations.css'; // Ensure this file is imported
import { Mic, MicOff, RefreshCw } from 'lucide-react';

const Recommendations = () => {
    const [user, loading] = useAuthState(auth);
    const [mood, setMood] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [listening, setListening] = useState(false);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const [preLoadedData, setPreLoadedData] = useState(null);

    const {
        transcript,
        resetTranscript,
        listening: isListening,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Load mood data from localStorage on component mount
    useEffect(() => {
        if (user) {
            const savedMoodData = localStorage.getItem('latestMoodData');
            if (savedMoodData) {
                try {
                    const moodData = JSON.parse(savedMoodData);
                    // Check if the mood data belongs to current user
                    if (moodData.userId === user.uid) {
                        setPreLoadedData(moodData);
                        setMood(moodData.mood);
                        // Automatically get recommendations for pre-loaded mood
                        getRecommendationsForMood(moodData.mood);
                    }
                } catch (err) {
                    console.error('Error parsing saved mood data:', err);
                }
            }
        }
    }, [user]);

    useEffect(() => {
        if (transcript) {
            setMood(transcript);
        }
    }, [transcript]);

    const getRecommendationsForMood = async (moodText) => {
        setError(null);
        setResult(null);
        setIsLoadingRecommendations(true);
        try {
            const response = await axios.post('http://localhost:8000/recommend', {
                user_mood: moodText,
            });
            setResult(response.data);
        } catch (err) {
            setError("❌ Could not fetch recommendations. Please try again.");
            console.error(err);
        }
        setIsLoadingRecommendations(false);
    };

    const getRecommendations = async () => {
        await getRecommendationsForMood(mood || transcript);
    };

    const refreshRecommendations = () => {
        if (mood || transcript) {
            getRecommendationsForMood(mood || transcript);
        }
    };

    const clearPreLoadedData = () => {
        setPreLoadedData(null);
        setMood('');
        setResult(null);
        localStorage.removeItem('latestMoodData');
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
                {preLoadedData && (
                    <div className="preloaded-info">
                        <span>📅 From your latest check-in</span>
                        <button onClick={clearPreLoadedData} className="clear-btn">✕</button>
                    </div>
                )}
            </div>

            {preLoadedData && (
                <div className="preloaded-banner">
                    <div className="preloaded-content">
                        <h4>🎯 Based on your latest mood: "{preLoadedData.moodDescription}"</h4>
                        <p>"{preLoadedData.description}"</p>
                        <small>Checked in {new Date(preLoadedData.timestamp).toLocaleString()}</small>
                    </div>
                </div>
            )}

            <div className="ai-chat-messages">
                {isLoadingRecommendations && (
                    <div className="loading-message">
                        <RefreshCw className="spinning" size={20} />
                        <span>Getting personalized recommendations...</span>
                    </div>
                )}
                
                {result && !result.error && (
                    <div>
                        <div className="recommendations-header">
                            <h3>� Recommendations for: "{result.detected_mood}"</h3>
                            <button onClick={refreshRecommendations} className="refresh-btn" title="Refresh recommendations">
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <h3>�🎥 YouTube Videos</h3>
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
                    placeholder={preLoadedData ? "Update your mood or get new recommendations..." : "How are you feeling today?"}
                />
                <button onClick={getRecommendations} disabled={isLoadingRecommendations}>
                    {isLoadingRecommendations ? 'Loading...' : 'Get Help'}
                </button>
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
