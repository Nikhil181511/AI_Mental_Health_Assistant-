import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, collection, query, where, getDocs } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import './userprofile.css';

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [streak, setStreak] = useState(0);
  const navigate = useNavigate();

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
            const uniqueDates = Array.from(new Set(entries.map(e => {
              const d = new Date(e.timestamp);
              return d.toISOString().slice(0, 10);
            })));
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
    };
    fetchUserData();
  }, []);

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
        navigate('/userprofile');
      }
    } catch (err) {
      setError('Failed to update name');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (user && user.email) {
      await sendPasswordResetEmail(auth, user.email);
      alert('Password reset email sent!');
    }
  };

  if (!user) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>
      <div className="profile-details">
        <div><strong>Name:</strong> <span>{user.displayName || 'N/A'}</span></div>
        <div><strong>Email:</strong> <span>{user.email}</span></div>
        <div><strong>Current Streak:</strong> <span>{streak} days</span></div>
      </div>
      <div className="profile-actions">
        <label>Update Name:
          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
        </label>
        {error && <div className="error-message">{error}</div>}
        <button className="save-btn" onClick={handleSaveProfile} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button className="change-password-btn" onClick={handleChangePassword}>
          Change Password
        </button>
        <button className="cancel-btn" onClick={() => navigate('/userprofile')}>
          Cancel
        </button>
      </div>
    </div>
  );
}
