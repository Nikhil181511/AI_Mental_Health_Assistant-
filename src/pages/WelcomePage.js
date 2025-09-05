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
  const features = [
    {
      id: 1,
      icon: <BrainCircuit size={48} color="#4e89e8" className="feature-icon" />,
      title: "Emotional Check-In",
      description: "Reflect on your mood daily with personalized prompts and visual summaries of your progress.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      icon: <Users size={48} color="#4e89e8" className="feature-icon" />,
      title: "Supportive Community",
      description: "Join a safe, moderated space to share feelings and connect with people who understand.",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      icon: <BookOpenText size={48} color="#4e89e8" className="feature-icon" />,
      title: "Mindfulness Library",
      description: "Access curated articles, meditation guides, and exercises to help ease stress and anxiety.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      icon: <Bot size={48} color="#4e89e8" className="feature-icon" />,
      title: "AI Wellness Assistant",
      description: "Ask questions, get real-time support, and receive coping strategies powered by smart AI.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      icon: <CalendarCheck size={48} color="#4e89e8" className="feature-icon" />,
      title: "Book a Therapist",
      description: "Browse licensed professionals and schedule therapy sessions at your convenience.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 6,
      icon: <FileText size={48} color="#4e89e8" className="feature-icon" />,
      title: "DocuMe",
      description: "Maintain a secure, private digital journal to process your emotions and track growth.",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 7,
      icon: <Coffee size={48} color="#4e89e8" className="feature-icon" />,
      title: "Relax",
      description: "Take deep breath and positive affirmations whenever you need a break.",
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="welcome-page">
      
      {/* Images Section */}
      <section className="images-section">
        <div className="fade-overlay"></div>
      </section>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to MindWell AI</h1>
          <p>Your daily companion for emotional wellness, mindful check-ins, and AI-powered support tailored to you.</p>
          <Link to="/login">
            <button className="checkin-btn">Get Started</button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <h1 className="features-title">Our Features</h1>
      <section className="features-container" id="features">
        {features.map((feature, index) => (
          <div 
            key={feature.id} 
            className={`feature-row ${index % 2 === 1 ? 'reverse' : ''}`}
          >
            <div className="feature-image">
              <img 
                src={feature.image} 
                alt={feature.title}
              />
            </div>
            
            <div className="feature-content">
              {feature.icon}
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default WelcomePage;