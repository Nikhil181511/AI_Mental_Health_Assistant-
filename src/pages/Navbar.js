import { Link } from 'react-router-dom'; // React Router for navigation

export default function Navbar() {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/" className="text-white font-medium hover:underline">Home</Link>
        </li>
        <li>
          <Link to="/checkin" className="text-white font-medium hover:underline">Check-in</Link>
        </li>
        <li>
          <Link to="/recommendations" className="text-white font-medium hover:underline">Recommendations</Link>
        </li>
        <li>
          <Link to="/library" className="text-white font-medium hover:underline">Library</Link>
        </li>
        <li>
          <Link to="/assistant" className="text-white font-medium hover:underline">AI Assistant</Link>
        </li>
        <li>
          <Link to="/community" className="text-white font-medium hover:underline">Community</Link>
        </li>
      </ul>
    </nav>
  );
}
