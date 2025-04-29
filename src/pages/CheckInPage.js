import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue } from 'firebase/database';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import './Check.css';

const CheckInPage = () => {
  const [mood, setMood] = useState(3);
  const [desc, setDesc] = useState('');
  const [recording, setRecording] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState('');
  const [checkIns, setCheckIns] = useState([]);

  const startRecording = () => {
    setRecording(true);
    // TODO: Add actual recording logic
  };

  const stopRecording = () => {
    setRecording(false);
    const fakeVoiceUrl = "https://example.com/voice.mp3";
    setVoiceUrl(fakeVoiceUrl);
  };

  const submitCheckIn = async () => {
    try {
      const newData = {
        mood: Number(mood),
        description: desc,
        voiceUrl,
        timestamp: Date.now(),
      };
      await push(ref(db, 'checkins'), newData);
      await axios.post('http://localhost:8000/checkin', newData);
      alert('✅ Check-in submitted!');
      setDesc('');
      setVoiceUrl('');
    } catch (error) {
      console.error("❌ Error submitting check-in:", error);
      alert('Failed to submit check-in.');
    }
  };

  useEffect(() => {
    const checkInRef = ref(db, 'checkins');
    onValue(checkInRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.values(data).map(entry => ({
          ...entry,
          time: new Date(entry.timestamp).toLocaleString()
        }));
        entries.sort((a, b) => a.timestamp - b.timestamp);
        setCheckIns(entries);
      } else {
        setCheckIns([]);
      }
    });
  }, []);

  return (
    <div className="checkin-container">
      <h2>How are you feeling today?</h2>

      <div>
        <label htmlFor="mood">Mood Level</label>
        <input
          id="mood"
          type="range"
          min="1"
          max="5"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
        <div className="mood-labels">
          <span>1 (Low)</span>
          <span>5 (High)</span>
        </div>
      </div>

      <div>
        <label htmlFor="desc">Describe how you're feeling</label>
        <textarea
          id="desc"
          placeholder="Write about your mood, thoughts, or anything you'd like to share..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div>
        <button
          className={`record-btn ${recording ? 'recording' : ''}`}
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? 'Stop Recording' : 'Record Voice'}
        </button>

        {voiceUrl && (
          <div className="audio-preview">
            <audio controls>
              <source src={voiceUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>

      <div>
        <button className="submit-btn" onClick={submitCheckIn}>
          Submit Check-In
        </button>
      </div>

      {checkIns.length > 0 && (
        <div className="chart-container">
          <h3>Mood Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={checkIns}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis domain={[1, 5]} tickCount={5} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
