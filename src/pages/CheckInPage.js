import React, { useState } from 'react';
import axios from 'axios';
const CheckInPage = () => {
  const [mood, setMood] = useState(3);
  const [desc, setDesc] = useState('');

  const submitCheckIn = async () => {
    await axios.post('http://localhost:8000/checkin', { mood, desc });
    alert('Check-in submitted!');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">How are you feeling today?</h2>
      <input type="range" min="1" max="5" value={mood} onChange={(e) => setMood(e.target.value)} className="w-full" />
      <p className="text-center">Mood Level: {mood}</p>
      <textarea
        className="w-full mt-4 p-2 border"
        placeholder="Describe how you're feeling..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button className="mt-4 bg-blue-500 text-white px-4 py-2" onClick={submitCheckIn}>Submit</button>
    </div>
  );
};
export default CheckInPage;