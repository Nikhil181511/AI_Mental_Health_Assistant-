import React, { useEffect, useState, useRef } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import './ProfileAnalysis.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Chart.js imports
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const ProfileAnalysis = () => {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const chartRef = useRef(null); // For managing canvas destruction
  const reportRef = useRef(null); // For export

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch profile data from backend on component mount
  useEffect(() => {
    if (user) {
      // Pass user ID to get user-specific analysis
      axios.get(`http://localhost:8000/analysis?user_id=${user.uid}`)
        .then(res => {
          console.log("Profile data:", res.data); // Check the structure here
          setProfileData(res.data);
        })
        .catch(err => {
          console.error("Error fetching data:", err);
          setAnalysisError("Unable to load your profile analysis. Please try again later or check your connection.");
        });
    }
  }, [user]);

  // Handle loading and error state
  if (loading) return <div className="loading-container">Loading...</div>;
  if (!user) return null;
  if (analysisError) return <div className="error-message">{analysisError}</div>;
  if (!profileData) return <div className="loading-analysis">Loading your analysis...</div>;
  if (profileData && profileData.message === "No check-ins available") {
    return (
      <div className="no-data-message">
        <h3>No check-ins available</h3>
        <p>Please complete a wellness check-in to see your profile analysis.</p>
        <button onClick={() => navigate('/checkin')} className="checkin-btn">
          Go to Check-in
        </button>
      </div>
    );
  }

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

  const exportAsPNG = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = 'mindwell_report.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const exportAsPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = canvas.height * (imgWidth / canvas.width);
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save('mindwell_report.pdf');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="profile-analysis" ref={reportRef}>
      <h2>Your Mental Wellness Summary</h2>
      <div className="export-bar">
        <button className="export-btn" onClick={exportAsPDF}>Download PDF</button>
        <button className="export-btn" onClick={exportAsPNG}>Download PNG</button>
        <button className="export-btn" onClick={printReport}>Print</button>
      </div>
      <div className="user-welcome">
        <p>Welcome, {user.displayName || user.email}!</p>
      </div>
      <div className="summary-card">
        <h3>{profileData.name}</h3>
        <p>Total Check-Ins: {profileData.total_checkins}</p>
        <p>Overall Mood: {profileData.overall_mood}</p>
        <p>Last Check-In: {profileData.last_checkin}</p>
        <p>Wellness Score: {profileData.wellness_score.toFixed(1)} / 5</p>
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
        <ul className="ai-summary-list">
          {profileData.ai_summary
            .split(/\n\*/g) // Split on newlines followed by *
            .map(point => point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) // Bold
            .map(point => point.trim())
            .filter(Boolean)
            .map((point, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: point }} />
            ))}
        </ul>
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
