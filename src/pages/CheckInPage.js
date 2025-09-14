import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import './Check.css';

// Firebase imports
import { db, auth, collection, addDoc, getDocs, query, where } from './firebase';

// Lucide Icons
import { Angry, Frown, Meh, Smile, Laugh, Mic, MicOff } from 'lucide-react';

const MOOD_LABELS = {
  1: "Very Poor",
  2: "Poor",
  3: "Neutral",
  4: "Good",
  5: "Very Good"
};

const MOOD_ICONS = {
  1: <Angry color="#ff4d4f" size={24} title="Very Poor" />,
  2: <Frown color="#ff7a45" size={24} title="Poor" />,
  3: <Meh color="#faad14" size={24} title="Neutral" />,
  4: <Smile color="#52c41a" size={24} title="Good" />,
  5: <Laugh color="#1890ff" size={24} title="Very Good" />
};

const CheckInPage = () => {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const [moodRating, setMoodRating] = useState(3);
  const [desc, setDesc] = useState('');
  const [checkIns, setCheckIns] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (transcript) {
      setDesc(transcript);
    }
  }, [transcript]);

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const fetchCheckIns = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, "checkins"), 
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          formattedTime: format(new Date(data.timestamp), 'MMM d, HH:mm')
        };
      });
      setCheckIns(entries.sort((a, b) => a.timestamp - b.timestamp));
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    }
  };

  const submitCheckIn = async () => {
    if (!user) {
      alert("Please login to save check-ins");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    const newData = {
      userId: user.uid, // Add user ID to the check-in data
      userEmail: user.email, // Optional: store user email for reference
      moodRating,
      moodDescription: MOOD_LABELS[moodRating],
      description: desc,
      timestamp: Date.now()
    };

    try {
      // Add check-in data to Firestore with user ID
      await addDoc(collection(db, "checkins"), newData);
      // Store latest mood data for recommendations
      const moodData = {
        mood: `${MOOD_LABELS[moodRating]} - ${desc}`.trim(),
        moodDescription: MOOD_LABELS[moodRating],
        description: desc,
        moodRating: moodRating,
        timestamp: Date.now(),
        userId: user.uid
      };
      localStorage.setItem('latestMoodData', JSON.stringify(moodData));
      setDesc('');
      fetchCheckIns();
      setShowSuggestion(true); // Show smart popup after check-in
    } catch (error) {
      alert("❌ Failed to submit.");
      console.error(error);
    }
    setIsSubmitting(false);
  };

  const formattedHistory = useMemo(() => {
    return checkIns.map(record => ({
      ...record,
      date: record.formattedTime
    }));
  }, [checkIns]);

  // Submit on Enter (without Shift) in description textarea
  const handleDescKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting) submitCheckIn();
    }
  };

  useEffect(() => {
    if (user) {
      fetchCheckIns();
    }
  }, [user]);

  // Page-specific background class (must appear before any conditional return to satisfy hooks rules)
  useEffect(() => {
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.classList.add('checkin-bg');
    return () => { if (rootEl) rootEl.classList.remove('checkin-bg'); };
  }, []);

  // Show loading while checking authentication
  if (loading) return <div className="loading-container">Loading...</div>;

  // Don't render if user is not authenticated
  if (!user) return null;

  // Smart suggestion logic
  const getSuggestions = () => {
    if (moodRating <= 2) {
      return [
        { label: 'Try Meditation', link: '/Game' },
        { label: 'Chat with AI Assistant', link: '/assistant' },
        { label: 'Book a Therapist', link: '/Book' }
      ];
    } else if (moodRating === 3) {
      return [
        { label: 'Try Meditation', link: '/Game' },
        { label: 'Chat with AI Assistant', link: '/assistant' }
      ];
    } else {
      return [
        { label: 'Explore Mindfulness Library', link: '/library' },
        { label: 'Join Community', link: '/community' }
      ];
    }
  };

  return (
    <div className="checkin-container">
      <h2>Your Mood Check‑In</h2>
      <p className="welcome-message">Hi {user.displayName || user.email}, lets start the day with a checkin.</p>

      <label className="mood-level-label">
        <span className="mood-level-text">Mood Level:</span> <span className="mood-current">{MOOD_LABELS[moodRating]}</span> {MOOD_ICONS[moodRating]}
      </label>

      <input
        type="range"
        min="1"
        max="5"
        value={moodRating}
        onChange={(e) => setMoodRating(Number(e.target.value))}
      />

      <div className="mood-labels">
        <span>{MOOD_ICONS[1]}</span>
        <span>{MOOD_ICONS[2]}</span>
        <span>{MOOD_ICONS[3]}</span>
        <span>{MOOD_ICONS[4]}</span>
        <span>{MOOD_ICONS[5]}</span>
      </div>

      <label>Description:</label>
      <div className="textarea-row">
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={handleDescKeyDown}
          placeholder="Type or speak about your mood..."
        />
        <button
          onClick={listening ? stopListening : startListening}
          className={`mic-btn ${listening ? 'active' : ''}`}
          title={listening ? 'Stop Listening' : 'Start Listening'}
        >
          {listening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {!browserSupportsSpeechRecognition && (
        <p>Your browser does not support speech recognition.</p>
      )}

      <button className="save-checkin-btn" onClick={submitCheckIn} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Check-In'}
      </button>

      {formattedHistory.length > 0 && (
        <div className="history-block">
          <h3>Your Mood History</h3>
          <div className="history-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip
                  formatter={(value, name, props) =>
                    [`${MOOD_LABELS[value]} ${props.payload.description ? ` - ${props.payload.description}` : ''}`, 'Mood']}
                />
                <Line
                  type="monotone"
                  dataKey="moodRating"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Smart Suggestion Popup Modal */}
      {showSuggestion && (
        <div className="smart-popup-overlay">
          <div className="smart-popup-modal">
            <button className="smart-popup-close" onClick={() => setShowSuggestion(false)} aria-label="Close">
              {/* X icon SVG, smaller and red */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3>What would you like to do next?</h3>
            
            <div className="smart-popup-actions">
              {getSuggestions().map((s, idx) => (
                <button
                  key={s.label}
                  className="smart-popup-btn"
                  onClick={() => {
                    setShowSuggestion(false);
                    navigate(s.link);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default CheckInPage;
