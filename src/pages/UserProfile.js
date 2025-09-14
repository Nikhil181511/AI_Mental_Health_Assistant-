import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db, collection, query, where, getDocs } from './firebase';
import './EditProfile.css';

export default function UserProfile() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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

  // Update user name in Firebase Auth
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (auth.currentUser) {
        await auth.currentUser.updateProfile({ displayName: editName });
        setUser({ ...auth.currentUser });
        setShowEditModal(false);
      }
    } catch (err) {
      setError('Failed to update name');
    }
    setSaving(false);
  };

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
          <div><strong>Name:</strong> <span>{user.displayName || 'N/A'}</span></div>
          <div><strong>Email:</strong> <span>{user.email}</span></div>
          <div><strong>Current Streak:</strong> <span>{streak} days</span></div>
        </div>
      )}
      <div className="profile-actions">
        <button className="edit-profile-btn" onClick={() => navigate('/edit-profile')}>
          Edit Profile
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
