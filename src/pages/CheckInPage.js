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
      
      alert("Mood check-in saved!");
      setDesc('');
      fetchCheckIns();
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

  useEffect(() => {
    if (user) {
      fetchCheckIns();
    }
  }, [user]);

  // Show loading while checking authentication
  if (loading) return <div className="loading-container">Loading...</div>;

  // Don't render if user is not authenticated
  if (!user) return null;

  return (
    <div className="checkin-container">
      <h2>How are you feeling right now?</h2>
      <p className="welcome-message">Welcome, {user.displayName || user.email}!</p>

      <label>
        Mood Level (1-5): {MOOD_LABELS[moodRating]} {MOOD_ICONS[moodRating]}
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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Type or speak about your mood..."
        />
        <button
          onClick={listening ? stopListening : startListening}
          style={{
            marginLeft: 10,
            backgroundColor: listening ? 'red' : '#4CAF50',
            borderRadius: '50%',
            width: 40,
            height: 40,
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
          title={listening ? 'Stop Listening' : 'Start Listening'}
        >
          {listening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {!browserSupportsSpeechRecognition && (
        <p>Your browser does not support speech recognition.</p>
      )}

      <button onClick={submitCheckIn} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Check-In'}
      </button>

      {formattedHistory.length > 0 && (
        <div style={{ height: 300, marginTop: 40 }}>
          <h3>Your Mood History</h3>
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
      )}
    </div>
  );
};

export default CheckInPage;
