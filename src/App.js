import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import Navbar from './pages/Navbar';
import CheckInPage from './pages/CheckInPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import LibraryPage from './pages/LibraryPage';
import BookTherapistPage from './pages/BookTherapistPage';
import ProfileAnalysisPage from './pages/ProfileAnalysis';
import BookTherapistPages from './pages/BookTherapistPage';
import MindfulBreathPage from './pages/MindfulBreath';
import RecommendationsPages from './pages/RecommendationsPage';
import CommunityChat from './pages/CommunityPage';

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ['/', '/login'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/assistant" element={<AIAssistantPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/book" element={<BookTherapistPage />} />
        <Route path="/community" element={<CommunityChat />} />
        <Route path="/profile" element={<ProfileAnalysisPage />} />
        <Route path="/Book" element={<BookTherapistPages />} />
        <Route path="/Game" element={<MindfulBreathPage />} />
        <Route path="/Recommend" element={<RecommendationsPages />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}
function App() {
  return (
    <>
      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;