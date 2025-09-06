import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>MINDWELL</h3>
          <p className="tagline">Your trusted companion for mental wellness, mindful breathing, and emotional well-being. Take the first step towards a healthier mind.</p>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/nikhilsavita186" target="_blank" rel="noopener noreferrer" className="social-link">
              <span>LinkedIn</span>
            </a>
            <a href="mailto:nikhilsavita186@gmail.com" className="social-link">
              <span>Email</span>
            </a>
          </div>
        </div>
        
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/checkin">Daily Check-in</a></li>
            <li><a href="/checkin">Recommendations</a></li>
            <li><a href="/checkin">AI Assistant</a></li>
            <li><a href="/checkin">Resource Library</a></li>
            <li><a href="/book">Book Therapist</a></li>
            <li><a href="checkin">Mindful Breathing</a></li>
          </ul>
        </div>

        <div className="footer-services">
          <h4>Our Services</h4>
          <ul>
            <li>Mental Health Assessment</li>
            <li>Personalized Recommendations</li>
            <li>Professional Therapy Sessions</li>
            <li>Mindfulness & Breathing Exercises</li>
            <li>Community Support</li>
            <li>24/7 AI Mental Health Assistant</li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <h4>Get in Touch</h4>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-label">Email:</span>
              <a href="mailto:nikhilsavita186@gmail.com">nikhilsavita186@gmail.com</a>
            </div>
            <div className="contact-item">
              <span className="contact-label">Phone:</span>
              <a href="tel:+918149745685">+91 81497 45685</a>
            </div>
            <div className="contact-item">
              <span className="contact-label">Support:</span>
              <span>Available 24/7</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} MindWell. All rights reserved.</p>
          <div className="footer-legal">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Mental Health Resources</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
