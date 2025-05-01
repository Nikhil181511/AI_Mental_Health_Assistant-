import React, { useEffect, useState, useRef } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import './ProfileAnalysis.css';

// Chart.js imports
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const ProfileAnalysis = () => {
  const [profileData, setProfileData] = useState(null);
  const chartRef = useRef(null); // For managing canvas destruction

  // Fetch profile data from backend on component mount
  useEffect(() => {
    axios.get('https://mh-backend-8w1j.onrender.com/analysis')
      .then(res => {
        console.log("Profile data:", res.data); // Check the structure here
        setProfileData(res.data);
      })
      .catch(err => console.error("Error fetching data:", err));
  }, []);


  // Handle loading state
  if (!profileData) return <div>Loading...</div>;

  // Data for the Line chart (Mood Over Time)
  const lineChartData = {
    labels: profileData.mood_over_time.map(entry => entry.date),
    datasets: [
      {
        label: 'Mood Score',
        data: profileData.mood_over_time.map(entry => entry.mood),
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      }
    ]
  };

  // Data for the Pie chart (Mood Distribution)
  // Data for the Pie chart (Mood Distribution)
  // Data for the Pie chart (Mood Distribution)
  const pieChartData = {
    labels: Object.keys(profileData.mood_distribution),
    datasets: [
      {
        data: Object.values(profileData.mood_distribution),
        backgroundColor: [
          '#4caf50',
          '#f44336',
          '#ffeb3b',
          '#2196f3',
          '#ff9800',
        ],
        hoverBackgroundColor: [
          '#4caf10',
          '#f42116',
          '#ffeb3b',
          '#2196f3',
          '#ff9800',
        ],
        borderColor: 'rgba(0, 0, 0, 0.1)', // Optional: to create a subtle border effect
        borderWidth: 1, // Optional: for subtle borders
      },
    ],
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          enabled: true, // Tooltip enabled on hover
        },
      },
      interaction: {
        mode: 'nearest', // Hovering nearest element
        intersect: false, // Keep hovering even if not over the center
      },
      elements: {
        arc: {
          borderWidth: 2, // Optional: border thickness for the chart segments
          hoverBorderWidth: 4, // Increase border width on hover for visual effect
          hoverBorderColor: '#000', // Optional: change border color on hover
        },
      },
    },
  };


  // Fixing Canvas Reuse by Clearing the Chart Before Rendering
  const renderChart = (canvasId) => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.chartInstance;
      if (chartInstance) {
        chartInstance.destroy();  // Destroy the previous chart instance to avoid reusing the same canvas
      }
    }
  };

  return (
    <div className="profile-analysis">
      <h2>Your Mental Wellness Summary</h2>
      <div className="summary-card">
        <h3>{profileData.name}</h3>
        <p>Total Check-Ins: {profileData.total_checkins}</p>
        <p>Overall Mood: {profileData.overall_mood}</p>
        <p>Last Check-In: {profileData.last_checkin}</p>
        <p>Wellness Score: {profileData.wellness_score} / 10</p>
      </div>

      <div className="charts">
        <div className="chart">
          <h4>Mood Over Time</h4>
          <Line data={lineChartData} />
        </div>
        <div className="chart">
          <h4>Mood Distribution</h4>
          <Pie data={pieChartData} />
        </div>
      </div>

      <div className="insights">
        <h4>🗣️ Voice Sentiment Insights</h4>
        <p>Most Common Tone: {profileData.voice_insights.most_common}</p>
        <p>Recent Spike: {profileData.voice_insights.spike_date} - {profileData.voice_insights.spike_reason}</p>
        <p>Trend: {profileData.voice_insights.trend}</p>
      </div>

      <div className="word-cloud">
        <h4>📚 Reflective Word Cloud</h4>
        <p>{profileData.word_cloud.join(', ')}</p>
      </div>

      <div className="ai-summary">
        <h4>🧠 AI Summary</h4>
        <p>{profileData.ai_summary}</p>
      </div>

      <div className="recommendations">
        <h4>🎯 Recommendations</h4>
        <ul>
          {profileData.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileAnalysis;
