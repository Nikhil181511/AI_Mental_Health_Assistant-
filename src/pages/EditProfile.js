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
        // Save location and phone to Firestore
        const userDocRef = collection(db, 'users');
        const qUser = query(userDocRef, where('userId', '==', auth.currentUser.uid));
        const userSnapshot = await getDocs(qUser);
        if (!userSnapshot.empty) {
          await updateDoc(userSnapshot.docs[0].ref, { location: editLocation, phone: editPhone });
        }
        navigate('/userprofile');
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
    <div className="profile-page">
      {/* Header Section with Gradient */}
      <div className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-title">Edit Profile</h1>
          
          {/* Profile Avatar */}
          <div className="profile-avatar">
            <img 
              src={require('../asserts/face.jpg')}
              alt="Profile"
              className="avatar-image"
            />
          </div>

          {/* Profile Basic Info */}
          <div className="profile-basic-info">
            <h2 className="profile-name">{user.displayName || 'Anonymous User'}</h2>
            <p className="profile-location">Your Location • Country</p>
          </div>

          {/* Stats Section */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{streak}</div>
              <div className="stat-label">Streak Days</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000</div>
              <div className="stat-label">Wellness Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="profile-content">
        {/* Profile Details */}
        <div className="profile-details-section">
          <h3 className="section-title">Profile Information</h3>
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{user.displayName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Current Streak:</span>
              <span className="detail-value">{streak} days</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{editLocation || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone Number:</span>
              <span className="detail-value">{editPhone || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value">
                {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

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
  );
}
