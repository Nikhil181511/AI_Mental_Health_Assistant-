import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db, collection, query, where, getDocs } from './firebase';
import './ProfileAnalysis.css';

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        setEditName(currentUser.displayName || '');
        // Fetch streak from checkins collection
        try {
          const q = query(
            collection(db, 'checkins'),
            where('userId', '==', currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          const entries = querySnapshot.docs.map(doc => doc.data());
          // Calculate streak
          let streakCount = 0;
          if (entries.length > 0) {
            // Get unique check-in dates
            const uniqueDates = Array.from(new Set(entries.map(e => {
              const d = new Date(e.timestamp);
              return d.toISOString().slice(0, 10);
            })));
            // Streak calculation
            let today = new Date().toISOString().slice(0, 10);
            if (uniqueDates.includes(today)) {
              streakCount = 1;
              for (let i = uniqueDates.length - 2; i >= 0; i--) {
                let expected = new Date(Date.parse(uniqueDates[i + 1]) - 86400000).toISOString().slice(0, 10);
                if (uniqueDates[i] === expected) {
                  streakCount++;
                } else {
                  break;
                }
              }
            }
          }
          setStreak(streakCount);
        } catch (err) {
          setStreak(0);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {user && (
        <div className="profile-details">
          <div><strong>Name:</strong> {user.displayName || 'N/A'}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Streak:</strong> {streak}</div>
        </div>
      )}
      <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
        Edit Profile
      </button>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="edit-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <label>Name:
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
            </label>
            <button className="save-btn" onClick={() => setShowEditModal(false)}>
              Save (demo only)
            </button>
            <br />
            <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
