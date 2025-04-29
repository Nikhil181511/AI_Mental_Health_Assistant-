import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import Navbar from './pages/Navbar';
import CheckInPage from './pages/CheckInPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import LibraryPage from './pages/LibraryPage';
import BookTherapistPage from './pages/BookTherapistPage';
import CommunityPage from './pages/CommunityPage';

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/assistant" element={<AIAssistantPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/book" element={<BookTherapistPage />} />
        <Route path="/community" element={<CommunityPage />} />
      </Routes>
    </Router>
  );
}

export default App;