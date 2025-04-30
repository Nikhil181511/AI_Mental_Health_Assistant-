import React from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  Users,
  BookOpenText,
  Bot,
  CalendarCheck,
  FileText,
  Coffee
} from 'lucide-react';
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

      {/* Features Section */}
      <h1>Our Features</h1>
      <section className="card-container" id="features">
        <div className="card">
          <BrainCircuit size={32} color="#4e89e8" />
          <h2>Emotional Check-In</h2>
          <p>Reflect on your mood daily with personalized prompts and visual summaries of your progress.</p>
        </div>

        <div className="card">
          <Users size={32} color="#4e89e8" />
          <h2>Supportive Community</h2>
          <p>Join a safe, moderated space to share feelings and connect with people who understand.</p>
        </div>

        <div className="card">
          <BookOpenText size={32} color="#4e89e8" />
          <h2>Mindfulness Library</h2>
          <p>Access curated articles, meditation guides, and exercises to help ease stress and anxiety.</p>
        </div>

        <div className="card">
          <Bot size={32} color="#4e89e8" />
          <h2>AI Wellness Assistant</h2>
          <p>Ask questions, get real-time support, and receive coping strategies powered by smart AI.</p>
        </div>

        <div className="card">
          <CalendarCheck size={32} color="#4e89e8" />
          <h2>Book a Therapist</h2>
          <p>Browse licensed professionals and schedule therapy sessions at your convenience.</p>
        </div>

        <div className="card">
          <FileText size={32} color="#4e89e8" />
          <h2>DocuMe</h2>
          <p>Maintain a secure, private digital journal to process your emotions and track growth.</p>
        </div>

        <div className="card">
          <Coffee size={32} color="#4e89e8" />
          <h2>Relax</h2>
          <p>Take deep Breath and positive affirmations whenever you need a break.</p>
        </div>
      </section>
    </div>
  );
}

export default WelcomePage;
