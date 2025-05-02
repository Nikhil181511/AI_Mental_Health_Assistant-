import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Book.css';

const BookTherapistPage = () => {
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
      const { data } = await axios.get('https://mh-backend-8w1j.onrender.com/appointments');
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const fetchTherapists = async () => {
    try {
      const { data } = await axios.get('https://mh-backend-8w1j.onrender.com/therapists');
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
      // Find selected therapist to include name in the booking data
      const selectedTherapist = therapists.find(t => t.id === form.therapistId);
      
      // Add therapist name to the form data to ensure it's available for display later
      const bookingData = {
        ...form,
        therapistName: selectedTherapist?.name || 'Unknown therapist',
        status: 'upcoming' // Ensure status is set for new appointments
      };
      
      await axios.post('http://localhost:8000/book', bookingData);
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

  if (loading) {
    return <div className="loading-container">Loading...</div>;
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

      {/* All Appointments */}
      <div className="appointments-section">
        <h3>Appointments Booked</h3>
        {allAppointments.length ? (
          allAppointments.map((appt) => {
            const therapist = therapists.find(t => t.id === appt.therapistId);
            return (
              <div key={appt.id} className="appointment-card">
                <p><strong>Therapist:</strong> {therapist?.name || 'No therapist selected'}</p>
                <p><strong>Name:</strong> {appt.name}</p>
                <p><strong>Time:</strong> {new Date(appt.datetime).toLocaleString()}</p>
                <p><strong>Concerns:</strong> {appt.concern}</p>
              </div>
            );
          })
        ) : (
          <p>No appointments booked</p>
        )}
      </div>
    </div>
  );
};

export default BookTherapistPage;
