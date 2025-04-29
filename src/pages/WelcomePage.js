import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BookOpenText, Bot } from 'lucide-react';
import Navbar from './Navbar'; // ✅ Custom navbar component
import './WelcomePage.css';

function WelcomePage() {
  return (
    <div className="welcome-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to MindWell AI</h1>
          <p>Your daily companion for emotional wellness, mindful check-ins, and AI-powered support tailored to you.</p>
          <Link to="/checkin">
            <button className="checkin-btn">Get Started</button>
          </Link>
        </div>
        <div className="ocean"></div>
      </section>

      {/* Card Section */}
      <section className="card-container" id="features">
        <div className="card">
          <BrainCircuit size={32} color="#4e89e8" />
          <h2>Emotional Check-in</h2>
          <p>Track and understand your emotions with our daily guided reflections.</p>
        </div>
        <div className="card">
          <BookOpenText size={32} color="#4e89e8" />
          <h2>Insightful Analytics</h2>
          <p>View mood trends and personalized mental health reports over time.</p>
        </div>
        <div className="card">
          <Bot size={32} color="#4e89e8" />
          <h2>AI Wellness Assistant</h2>
          <p>Chat with our AI for instant support, grounding exercises, and advice.</p>
        </div>
      </section>
    </div>
  );
}

export default WelcomePage;
