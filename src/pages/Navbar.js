import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import './Navbar.css';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      closeSidebar();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar-desktop">
        <div className="logo">
          MindWell AI
        </div>
        <ul className="nav-links-desktop">
         
          <li>
            <Link to="/checkin" className="nav-link">Check-in</Link>
          </li>
          <li>
            <Link to="/library" className="nav-link">Library</Link>
          </li>
          <li>
            <Link to="/assistant" className="nav-link">AI Assistant</Link>
          </li>
          <li>
            <Link to="/community" className="nav-link">Community</Link>
          </li>
          <li>
            <Link to="/profile" className="nav-link">DocuMe</Link>
          </li>
          <li>
            <Link to="/Book" className="nav-link">Book Therapist</Link>
          </li>
          <li>
            <Link to="/Game" className="nav-link">Relax</Link>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile Navbar */}
      <nav className="navbar-mobile">
        <div className="mobile-header">
          <div className="logo">
            MindWell AI
          </div>
          <button 
            onClick={toggleSidebar}
            className="menu-button"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <ul className="nav-links-mobile">
          <li>
            <Link to="/" className="nav-link-mobile" onClick={closeSidebar}>Home</Link>
          </li>
          <li>
            <Link to="/checkin" className="nav-link-mobile" onClick={closeSidebar}>Check-in</Link>
          </li>
          <li>
            <Link to="/library" className="nav-link-mobile" onClick={closeSidebar}>Library</Link>
          </li>
          <li>
            <Link to="/assistant" className="nav-link-mobile" onClick={closeSidebar}>AI Assistant</Link>
          </li>
          <li>
            <Link to="/community" className="nav-link-mobile" onClick={closeSidebar}>Community</Link>
          </li>
          <li>
            <Link to="/profile" className="nav-link-mobile" onClick={closeSidebar}>DocuMe</Link>
          </li>
          <li>
            <Link to="/Book" className="nav-link-mobile" onClick={closeSidebar}>Book Therapist</Link>
          </li>
          <li>
            <Link to="/Game" className="nav-link-mobile" onClick={closeSidebar}>Relax</Link>
          </li>
          <li className="logout-item">
            <button onClick={handleLogout} className="logout-btn-mobile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}