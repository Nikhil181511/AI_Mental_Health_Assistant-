import React, { useEffect, useState } from 'react';
import axios from 'axios';
const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/recommend').then(res => setRecommendations(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Your Recommendations</h2>
      <ul>
        {recommendations.map((item, idx) => <li key={idx} className="mb-2">{item}</li>)}
      </ul>
    </div>
  );
};
export default RecommendationsPage;