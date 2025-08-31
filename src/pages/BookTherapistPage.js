import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, collection, addDoc, query, where, getDocs } from './firebase';
import './Book.css';

const BookTherapistPage = () => {
  const [user, loadingUser] = useAuthState(auth);
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    datetime: '', 
    concern: '',
    therapistId: ''
  });
  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    if (!user && !loadingUser) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchAppointments(),
      fetchTherapists()
    ]).then(() => setLoading(false))
    .catch(err => {
      console.error("Error loading initial data:", err);
      setLoading(false); // Ensure loading state is cleared even on error
    });
  }, []);

  const fetchAppointments = async () => {
    try {
      if (!user) return setAppointments([]);
      // Fetch only appointments for current user from Firestore
      const q = query(collection(db, 'appointments'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userAppointments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(userAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const fetchTherapists = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/therapists');
      setTherapists(data);
    } catch (err) {
      console.error('Error fetching therapists:', err);
      // Use region-specific mock data if API fails
      setTherapists([
        { id: 1, name: "Dr. Priya Naik", specialty: "Cognitive Behavioral Therapy", location: "Panaji, Goa", availability: "Mon-Wed" },
        { id: 2, name: "Dr. Rajesh Kamath", specialty: "Trauma Therapy", location: "Margao, Goa", availability: "Tue-Fri" },
        { id: 3, name: "Dr. Sneha D'Souza", specialty: "Family Counseling", location: "Vasco da Gama, Goa", availability: "Mon-Thu" },
        { id: 4, name: "Dr. Vikram Shetty", specialty: "Depression & Anxiety", location: "Mapusa, Goa", availability: "Wed-Sat" },
        { id: 5, name: "Dr. Anisha Pai", specialty: "Mindfulness Therapy", location: "Ponda, Goa", availability: "Mon, Wed, Fri" },
        { id: 6, name: "Dr. Sunita Verma", specialty: "Child Psychology", location: "Calangute, Goa", availability: "Tue-Thu" },
        { id: 7, name: "Dr. Manoj Prabhu", specialty: "Addiction Counseling", location: "Mangalore, Karnataka", availability: "Mon-Fri" },
        { id: 8, name: "Dr. Leela Kamat", specialty: "Relationship Therapy", location: "Panjim, Goa", availability: "Tue, Thu, Sat" },
        { id: 9, name: "Dr. Rahul Sawant", specialty: "Stress Management", location: "Mumbai, Maharashtra", availability: "Mon-Wed, Fri" }
      ]);
    }
  };

  const submitForm = async () => {
    if (!form.therapistId) {
      alert('Please select a therapist');
      return;
    }
    
    setIsBooking(true);
    try {
      if (!user) throw new Error('User not authenticated');
      // Find selected therapist to include name in the booking data
      const selectedTherapist = therapists.find(t => t.id === form.therapistId);
      // Add therapist name, userId, userEmail to the booking data
      const bookingData = {
        ...form,
        therapistName: selectedTherapist?.name || 'Unknown therapist',
        status: 'upcoming',
        userId: user.uid,
        userEmail: user.email
      };
      await addDoc(collection(db, 'appointments'), bookingData);
      alert('Appointment booked successfully!');
      setForm({ name: '', phone: '', datetime: '', concern: '', therapistId: '' });
      fetchAppointments(); // Refresh after booking
    } catch (err) {
      console.error('Error booking appointment:', err);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const selectTherapist = (therapistId) => {
    setForm({ ...form, therapistId });
    
    // Smooth scroll to booking form after selecting a therapist
    setTimeout(() => {
      document.querySelector('.booking-form').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 300);
  };

  const getCurrentDate = () => {
    return new Date().toISOString(); // Get current date in ISO format (same format as datetime input)
  };

  // Sort appointments into upcoming and past combined
  const allAppointments = appointments
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime)); // Most recent first

  if (loadingUser || loading) {
    return <div className="loading-container">Loading...</div>;
  }
  if (!user) {
    return <div className="error-message">Please log in to book a therapist.</div>;
  }

  return (
    <div className="therapist-booking-page">
      <h2>Book a Therapist</h2>

      <div className="therapists-section">
        <h3>Available Therapists</h3>
        <div className="therapists-grid">
          {therapists.map((therapist) => (
            <div 
              key={therapist.id} 
              className={`therapist-card ${form.therapistId === therapist.id ? 'selected' : ''}`}
              onClick={() => selectTherapist(therapist.id)}
            >
              <div className="therapist-avatar">
                {therapist.name.charAt(0)}
              </div>
              <div className="therapist-info">
                <h4>{therapist.name}</h4>
                <p className="specialty">{therapist.specialty}</p>
                <p className="location">
                  <span className="location-icon">📍</span> {therapist.location}
                </p>
                <p className="availability">Available: {therapist.availability}</p>
              </div>
              <div className="select-indicator"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="booking-form">
        <div className="form-field">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            className="form-input"
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            className="form-input"
            name="phone"
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={handleChange}
            type="tel"
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="datetime">Preferred Date & Time</label>
          <input
            id="datetime"
            className="form-input"
            name="datetime"
            value={form.datetime}
            onChange={handleChange}
            type="datetime-local"
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="concern">Your Concerns</label>
          <textarea
            id="concern"
            className="form-textarea"
            name="concern"
            placeholder="Please describe your concerns briefly..."
            value={form.concern}
            onChange={handleChange}
          />
        </div>

        <button
          onClick={submitForm}
          disabled={isBooking || !form.therapistId}
          className={`submit-button ${isBooking ? 'loading' : ''}`}
        >
          {isBooking ? 'Booking...' : 'Book Appointment'}
        </button>
        
        {!form.therapistId && 
          <p className="selection-note">Please select a therapist above</p>
        }
      </div>

      {/* Appointment History - Upcoming and Completed */}
      <div className="appointments-section">
        <h3>Upcoming Appointments</h3>
        {allAppointments.filter(appt => new Date(appt.datetime) > new Date()).length ? (
          allAppointments.filter(appt => new Date(appt.datetime) > new Date()).map((appt) => {
            const therapist = therapists.find(t => t.id === appt.therapistId);
            const apptDate = new Date(appt.datetime);
            return (
              <div key={appt.id} className="appointment-card upcoming-history pro-appt-card">
                <div className="appt-status-tag upcoming-tag"></div>
                <div className="appt-details-row">
                  <span className="appt-label highlight-label"><b>Therapist: </b></span>
                  <span className="appt-value">{therapist?.name || 'No therapist selected'}</span>
                </div>
                <div className="appt-details-row">
                  <span className="appt-label highlight-label"><b>Name: </b></span>
                  <span className="appt-value">{appt.name}</span>
                </div>
                <div className="appt-details-row">
                  <span className="appt-label highlight-label"><b>Date & Time: </b></span>
                  <span className="appt-value">{apptDate.toLocaleString()}</span>
                </div>
                <div className="appt-details-row">
                  <span className="appt-label highlight-label"><b>Concerns: </b></span>
                  <span className="appt-value">{appt.concern}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p>No upcoming appointments</p>
        )}
        <h3 style={{marginTop: '40px'}}>Completed Appointments</h3>
        {allAppointments.filter(appt => new Date(appt.datetime) <= new Date()).length ? (
          allAppointments.filter(appt => new Date(appt.datetime) <= new Date()).map((appt) => {
            const therapist = therapists.find(t => t.id === appt.therapistId);
            const apptDate = new Date(appt.datetime);
            return (
              <div key={appt.id} className="appointment-card completed-history pro-appt-card">
                <div className="appt-status-tag completed-tag"></div>
                <div className="appt-details-row">
                  <span className="appt-label highlight-label"><b>Therapist: </b></span>
                  <span className="appt-value">{therapist?.name || 'No therapist selected'}</span>
                </div>
                <div className="appt-details-row">
                  <span className="appt-label highlight-label"><b>Name: </b></span>
                  <span className="appt-value">{appt.name}</span>
                </div>
                <div className="appt-details-row">
                  <span className="appt-label highlight-label"><b>Date & Time: </b></span>
                  <span className="appt-value">{apptDate.toLocaleString()}</span>
                </div>
                <div className="appt-details-row">
                  <span className="appt-label highlight-label"><b>Concerns: </b></span>
                  <span className="appt-value">{appt.concern}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p>No completed appointments</p>
        )}
      </div>
    </div>
  );
};

export default BookTherapistPage;
