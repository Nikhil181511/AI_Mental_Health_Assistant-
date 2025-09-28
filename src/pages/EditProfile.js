import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, collection, query, where, getDocs } from './firebase';
import { updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import './EditProfile.css';

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [streak, setStreak] = useState(0);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        setEditName(currentUser.displayName || '');
        // Fetch location and phone from Firestore
        try {
          // Get highest streak from localStorage
          const maxStreak = Number(localStorage.getItem('maxStreak') || '0');
          setStreak(maxStreak);

          // Get location and phone from users collection
          const userDocRef = collection(db, 'users');
          const qUser = query(userDocRef, where('userId', '==', currentUser.uid));
          const userSnapshot = await getDocs(qUser);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            setEditLocation(userData.location || '');
            setEditPhone(userData.phone || '');
            setWellnessScore(userData.wellnessScore || 0);
            setShowOnLeaderboard(userData.showOnLeaderboard !== false); // default true
          }
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
        // Use updateProfile from firebase/auth
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(auth.currentUser, { displayName: editName });
        setUser({ ...auth.currentUser, displayName: editName });
        // Save location, phone, and leaderboard preference to Firestore
        const userDocRef = collection(db, 'users');
        const qUser = query(userDocRef, where('userId', '==', auth.currentUser.uid));
        const userSnapshot = await getDocs(qUser);
        if (!userSnapshot.empty) {
          await updateDoc(userSnapshot.docs[0].ref, { location: editLocation, phone: editPhone, showOnLeaderboard });
        } else {
          // Create user document if not exists
          const { addDoc } = await import('firebase/firestore');
          await addDoc(userDocRef, {
            userId: auth.currentUser.uid,
            location: editLocation,
            phone: editPhone,
            email: auth.currentUser.email,
            name: editName,
            showOnLeaderboard
          });
        }
        // Do not navigate away; stay on edit profile page
      }
    } catch (err) {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (user && user.email) {
      await sendPasswordResetEmail(auth, user.email);
      alert('Password reset email sent!');
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
  <div className="profile-page" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Card view for profile info on the left */}
      <div style={{ flex: '0 0 350px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 0' }}>
        <div className="profile-card" style={{ background: 'linear-gradient(120deg, #f8ffae 0%, #43c6ac 100%)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(67,198,172,0.13)', padding: '2.5rem 2rem', minWidth: 320, maxWidth: 350 }}>
          <h2 className="profile-name" style={{ textAlign: 'center', marginBottom: '1rem' }}>{user.displayName || 'Anonymous User'}</h2>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="profile-info-row"><strong>Location:</strong> {editLocation || 'N/A'}</div>
            <div className="profile-info-row"><strong>Email:</strong> {user.email}</div>
            <div className="profile-info-row"><strong>Phone:</strong> {editPhone || 'N/A'}</div>
            <div className="profile-info-row"><strong>Member Since:</strong> {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <div className="stat-item" style={{ minWidth: 100 }}>
              <div className="stat-number">{streak}</div>
              <div className="stat-label">Streak Days</div>
            </div>
            <div className="stat-item" style={{ minWidth: 100 }}>
              <div className="stat-number">{wellnessScore}</div>
              <div className="stat-label">Wellness Points</div>
            </div>
          </div>
        </div>
      </div>
      {/* Main content and form on the right */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
        <div className="profile-content" style={{ maxWidth: 600, width: '100%' }}>
          {/* Edit Actions */}
          <div className="profile-actions-section">
            <h3 className="section-title">Edit Profile</h3>
            <div className="profile-actions">
              <div className="form-group">
                <label htmlFor="editName" className="form-label">Update Name:</label>
                <input 
                  id="editName"
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editLocation" className="form-label">Location:</label>
                <input 
                  id="editLocation"
                  type="text" 
                  value={editLocation} 
                  onChange={e => setEditLocation(e.target.value)} 
                  placeholder="Enter your location"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPhone" className="form-label">Phone Number:</label>
                <input 
                  id="editPhone"
                  type="text" 
                  value={editPhone} 
                  onChange={e => setEditPhone(e.target.value)} 
                  placeholder="Enter your phone number"
                  className="form-input"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label className="form-label">Show my name on leaderboard:</label>
                <button
                  type="button"
                  className={showOnLeaderboard ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ marginBottom: '1rem' }}
                  onClick={() => setShowOnLeaderboard(prev => !prev)}
                >
                  {showOnLeaderboard ? 'Yes, display my name' : 'No, keep my name hidden'}
                </button>
              </div>
              <div className="button-group">
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleChangePassword}
                >
                  Change Password
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => navigate('/userprofile')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
