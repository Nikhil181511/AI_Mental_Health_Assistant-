import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import UserProfile from './pages/UserProfile';
import LoginPage from './pages/LoginPage';
import Navbar from './pages/Navbar';
import EditProfile from './pages/EditProfile';
import CheckInPage from './pages/CheckInPage';
import AIAssistantPage from './pages/AIAssistantPage';
import LibraryPage from './pages/LibraryPage';
import BookTherapistPage from './pages/BookTherapistPage';
import DocuMe from './pages/ProfileAnalysis';
import BookTherapistPages from './pages/BookTherapistPage';
import MindfulBreathPage from './pages/MindfulBreath';
import RecommendationsPages from './pages/RecommendationsPage';
import CommunityChat from './pages/CommunityPage';
import TaskPage from './pages/task';

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
        <Route path="/assistant" element={<AIAssistantPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/book" element={<BookTherapistPage />} />
        <Route path="/community" element={<CommunityChat />} />
        <Route path="/docume" element={<DocuMe />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/Book" element={<BookTherapistPages />} />
        <Route path="/Game" element={<MindfulBreathPage />} />
        <Route path="/recommend" element={<RecommendationsPages />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/task" element={<TaskPage />} />
        <Route path="/leaderboard" element={require('./pages/leaderboad.js').default()} />
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