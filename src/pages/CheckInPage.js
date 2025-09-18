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
  // Streak system state
  const [streak, setStreak] = useState(0);
  const [lastCheckInDate, setLastCheckInDate] = useState(null);
  const [streakBroken, setStreakBroken] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

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
          formattedTime: format(new Date(data.timestamp), 'MMM d, HH:mm'),
          dateOnly: format(new Date(data.timestamp), 'yyyy-MM-dd')
        };
      });
      const sortedEntries = entries.sort((a, b) => a.timestamp - b.timestamp);
      setCheckIns(sortedEntries);
  // Improved streak calculation: streak only breaks if user misses two consecutive days
  let streakCount = 0;
  let lastDate = null;
  let broken = false;
  let restoreStreakDone = localStorage.getItem('restoreStreakDone') === '1';
  let restoreStreakValue = localStorage.getItem('restoreStreakValue');
  let triggerStreakRestore = localStorage.getItem('triggerStreakRestore') === '1';
  let highestStreak = Number(localStorage.getItem('highestStreak') || '0');
      if (sortedEntries.length > 0) {
        const uniqueDates = Array.from(new Set(sortedEntries.map(e => e.dateOnly)));
        let today = format(new Date(), 'yyyy-MM-dd');
        let yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        let dayBeforeYesterday = format(new Date(Date.now() - 2 * 86400000), 'yyyy-MM-dd');

        // If last check-in is today, streak continues
        if (uniqueDates[uniqueDates.length - 1] === today) {
          streakCount = 1;
          lastDate = today;
          for (let i = uniqueDates.length - 2; i >= 0; i--) {
            let expected = format(new Date(Date.parse(uniqueDates[i + 1]) - 86400000), 'yyyy-MM-dd');
            if (uniqueDates[i] === expected) {
              streakCount++;
              lastDate = uniqueDates[i];
            } else {
              break;
            }
          }
          broken = false;
        } else if (uniqueDates[uniqueDates.length - 1] === yesterday) {
          streakCount = 1;
          lastDate = yesterday;
          for (let i = uniqueDates.length - 2; i >= 0; i--) {
            let expected = format(new Date(Date.parse(uniqueDates[i + 1]) - 86400000), 'yyyy-MM-dd');
            if (uniqueDates[i] === expected) {
              streakCount++;
              lastDate = uniqueDates[i];
            } else {
              break;
            }
          }
          broken = false;
        } else if (uniqueDates[uniqueDates.length - 1] === dayBeforeYesterday) {
          // Missed two days, streak broken
          streakCount = 0;
          lastDate = uniqueDates[uniqueDates.length - 1];
          broken = true;
        } else {
          streakCount = 0;
          lastDate = uniqueDates[uniqueDates.length - 1];
          broken = true;
        }
      }
      // Update highest streak
      if (streakCount > highestStreak) {
        localStorage.setItem('highestStreak', streakCount.toString());
        highestStreak = streakCount;
      }
      // Save highest streak for restore
      if (broken && highestStreak > 0) {
        localStorage.setItem('prevStreakValue', highestStreak.toString());
      }
      // Restore streak only when user closes notification
      if (triggerStreakRestore) {
        const restoreValue = restoreStreakValue || highestStreak || '1';
        setStreak(Number(restoreValue));
        setStreakBroken(false);
        setLastCheckInDate(lastDate);
        localStorage.removeItem('restoreStreakDone');
        localStorage.removeItem('restoreStreakValue');
        localStorage.removeItem('prevStreakValue');
        localStorage.removeItem('triggerStreakRestore');
        return;
      }
      setStreak(streakCount);
      setLastCheckInDate(lastDate);
      setStreakBroken(broken);
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
      <div className="streak-badge" style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <span style={{ background: '#ffe066', borderRadius: '20px', padding: '8px 16px', fontWeight: 'bold', boxShadow: '0 2px 8px #eee', display: 'flex', alignItems: 'center' }}>
          🔥 Streak: {streak}
        </span>
      </div>
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
      {/* Updated streak restore modal with close button */}
      {streakBroken && (
        <div className="restore-streak-modal">
          <div>
            <button
              className="notification-close"
              onClick={() => setStreakBroken(false)}
              aria-label="Close notification"
            >
              ×
            </button>
            <h3>🔥 Streak Broken 😔</h3>
            <p>You missed your daily check-in. Restore your streak by completing a 2 min meditation:</p>
            <button onClick={() => {
              setStreakBroken(false);
              navigate('/Game?restoreStreak=1&duration=2');
            }}>
              Do 2 min Meditation
            </button>
            <button onClick={() => setStreakBroken(false)}>
              Skip (Start new streak)
            </button>
          </div>
        </div>
      )}
      {/* Restore modal navigation (to MindfulBreath.js) */}
      {showRestoreModal && (
        <div className="restore-streak-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 101 }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: 350, margin: '80px auto', padding: 24, boxShadow: '0 4px 24px #aaa', textAlign: 'center' }}>
            <h3>Restore Streak</h3>
            <br />
            <p>Complete a 2 min meditation session to restore your streak.</p>
            <button style={{ margin: '12px 0', padding: '10px 18px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { setShowRestoreModal(false); setStreakBroken(false); navigate('/MindfulBreath?restoreStreak=1&duration=2'); }}>
              Go to Meditation
            </button>
            <br />
            <button style={{ marginTop: '8px', color: '#e74c3c', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { setShowRestoreModal(false); setStreakBroken(false); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Smart Suggestion Popup Modal */}
      {showSuggestion && (
        <div className="smart-popup-overlay">
          <div className="smart-popup-modal">
            <span
              className="smart-popup-close"
              onClick={() => setShowSuggestion(false)}
              aria-label="Close"
              style={{ position: 'absolute', top: 1, right: 4, fontSize: 32, color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold', background: 'none', border: 'none' }}
            >x</span>
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
