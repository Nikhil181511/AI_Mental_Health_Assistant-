import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import './Navbar.css';
import { User } from 'lucide-react';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
          <li><Link to="/checkin" className="nav-link">Check-in</Link></li>
          <li><Link to="/task" className="nav-link">Daily Tasks</Link></li>
          <li><Link to="/library" className="nav-link">Library</Link></li>
          <li><Link to="/assistant" className="nav-link">AI Assistant</Link></li>
          <li><Link to="/community" className="nav-link">Community</Link></li>
          <li><Link to="/docume" className="nav-link">DocuMe</Link></li>
          <li><Link to="/Book" className="nav-link">Book Therapist</Link></li>
          <li><Link to="/Game" className="nav-link">Relax</Link></li>
          <li><Link to="/leaderboard" className="nav-link">Leaderboard</Link></li>
          <li style={{position: 'relative'}}>
            <span style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}} onClick={() => setShowProfileMenu(v => !v)}>
              <User size={24} style={{marginRight: 6}} />
            </span>
            {showProfileMenu && (
              <div style={{position: 'absolute', top: 36, right: 0, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #eee', padding: '12px 18px', minWidth: 140, zIndex: 100}}>
                <div style={{marginBottom: 10, cursor: 'pointer', color: '#1890ff', fontWeight: 'bold'}} onClick={() => { setShowProfileMenu(false); navigate('/edit-profile'); }}>Edit Profile</div>
                <div style={{cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold'}} onClick={async () => { await signOut(auth); navigate('/'); setShowProfileMenu(false); }}>Logout</div>
              </div>
            )}
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
            <Link to="/checkin" className="nav-link-mobile" onClick={closeSidebar}>Check-in</Link>
          </li>
          <li>
            <Link to="/task" className="nav-link-mobile" onClick={closeSidebar}>Daily Tasks</Link>
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
            <Link to="/docume" className="nav-link-mobile" onClick={closeSidebar}>DocuMe</Link>
          </li>
          <li>
            <Link to="/Book" className="nav-link-mobile" onClick={closeSidebar}>Book Therapist</Link>
          </li>
          <li>
            <Link to="/Game" className="nav-link-mobile" onClick={closeSidebar}>Relax</Link>
          </li>
          <li>
            <Link to="/leaderboard" className="nav-link-mobile" onClick={closeSidebar}>Leaderboard</Link>
          </li>
          <li style={{position: 'relative'}}>
            <span style={{cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px'}} onClick={() => setShowProfileMenu(v => !v)}>
              <h4 style={{color: 'white', margin: 0, marginRight: 6}}>Profile</h4>
              <User size={28} style={{marginRight: 6}} />
            </span>
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: 40,
                right: 0,
                left: 'auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 16px #ddd',
                padding: '18px 24px',
                minWidth: 160,
                zIndex: 100,
                width: 'max-content',
                maxWidth: '90vw',
                textAlign: 'center',
              }}>
                <div style={{marginBottom: 16, cursor: 'pointer', color: '#1890ff', fontWeight: 'bold', fontSize: 18, padding: '10px 0'}} onClick={() => { setShowProfileMenu(false); navigate('/edit-profile'); }}>Edit Profile</div>
                <div style={{cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold', fontSize: 18, padding: '10px 0'}} onClick={async () => { await signOut(auth); navigate('/'); setShowProfileMenu(false); }}>Logout</div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </>
  );
}