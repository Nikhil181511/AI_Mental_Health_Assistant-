import React from 'react';
import { Link } from 'react-router-dom'; // React Router for navigation
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar flex items-center justify-between px-6 py-4 bg-blue-600 shadow-md">
      <div className="logo text-white text-2xl font-bold">
        MindWell AI
      </div>
      <ul className="nav-links flex space-x-6">
        <li>
          <Link to="/" className="text-white font-medium hover">Home</Link>
        </li>
        <li>
          <Link to="/checkin" className="text-white font-medium hover">Check-in</Link>
        </li>
        <li>
          <Link to="/library" className="text-white font-medium hover">Library</Link>
        </li>
        <li>
          <Link to="/assistant" className="text-white font-medium hover">AI Assistant</Link>
        </li>
        <li>
          <Link to="/community" className="text-white font-medium hover">Community</Link>
        </li>
        <li>
          <Link to="/profile" className="text-white font-medium hover:underline">DocuMe</Link>
        </li>
        <li>
          <Link to="/Book" className="text-white font-medium hover:underline">Book Therapist</Link>
        </li>
        <li>
          <Link to="/Game" className="text-white font-medium hover:underline">Relax</Link>
        </li>
      </ul>
 </nav>
 );
}