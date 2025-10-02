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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

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
      setLoading(false);
    });
  }, [user, loadingUser]);

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
      const { data } = await axios.get('https://mh-backend-8w1j.onrender.com/therapists');
      const templates = {
        1: { experience: '5 years of experience', languages: 'Fluent in English, Hindi, Konkani', rating: 'Top-Rated', sessions: '120 happy client sessions', price: '₹2500 for 50 min', description: "Specialized in anxiety, depression, and stress management. I use evidence-based approaches to help you overcome life's challenges.", image: 'doc1.jpg', verified: true, availability: 'Tomorrow, 06 Sep, 07:30 pm IST' },
        2: { experience: '8 years of experience', languages: 'Fluent in English, Hindi, Marathi', rating: 'Top-Rated', sessions: '200+ happy client sessions', price: '₹3000 for 50 min', description: 'Expert in trauma recovery and PTSD treatment. I provide a safe space for healing and growth.', image: 'doc2.jpg', verified: true, availability: 'Today, 05 Sep, 08:00 pm IST' },
        3: { experience: '6 years of experience', languages: 'Fluent in English, Hindi, Konkani', rating: 'Highly Rated', sessions: '150 happy client sessions', price: '₹2800 for 50 min', description: 'Focused on family dynamics, relationship counseling, and communication improvement.', image: 'doc3.jpg', verified: true, availability: 'Tomorrow, 06 Sep, 06:00 pm IST' },
        4: { experience: '7 years of experience', languages: 'Fluent in English, Hindi, Kannada', rating: 'Top-Rated', sessions: '180 happy client sessions', price: '₹2700 for 50 min', description: 'Specializing in mood disorders with a compassionate, holistic approach to mental wellness.', image: 'doc4.jpg', verified: true, availability: 'Today, 05 Sep, 09:30 pm IST' },
        5: { experience: '4 years of experience', languages: 'Fluent in English, Hindi, Konkani', rating: 'Highly Rated', sessions: '90 happy client sessions', price: '₹2400 for 50 min', description: 'Integrating mindfulness and meditation techniques for stress reduction and emotional balance.', image: 'doc5.jpg', verified: true, availability: 'Tomorrow, 06 Sep, 05:30 pm IST' },
        6: { experience: '9 years of experience', languages: 'Fluent in English, Hindi, Punjabi', rating: 'Top-Rated', sessions: '250+ happy client sessions', price: '₹3200 for 50 min', description: 'Expert in child development, behavioral issues, and family support systems.', image: 'doc6.jpg', verified: true, availability: 'Today, 05 Sep, 04:00 pm IST' },
        7: { experience: '10 years of experience', languages: 'Fluent in English, Hindi, Tulu', rating: 'Top-Rated', sessions: '300+ happy client sessions', price: '₹3500 for 50 min', description: 'Comprehensive addiction recovery programs with ongoing support and relapse prevention.', image: 'doc7.jpg', verified: true, availability: 'Tomorrow, 06 Sep, 07:00 pm IST' },
        8: {
          experience: '6 years of experience',
          languages: 'Fluent in English, Hindi, Marathi',
          rating: 'Highly Rated',
          sessions: 'Available for all PCCE students',
          price: 'Free for PCCE students',
          description: 'Providing emotional support, academic guidance, and personal counseling for students at PCCE.',
          image: 'doc8.jpg',
          verified: true,
          availability: 'Mon-Fri, 10:00 am - 4:00 pm'
        },
        9: {
          experience: '5 years of experience',
          languages: 'Fluent in English, Hindi, Marathi',
          rating: 'Highly Rated',
          sessions: 'Available for all Don Bosco students',
          price: 'Free for Don Bosco students',
          description: 'Helping students manage stress, academic challenges, and personal issues at Don Bosco.',
          image: 'doc9.jpg',
          verified: true,
          availability: 'Mon-Fri, 11:00 am - 5:00 pm'
        }
      };

      const enriched = (Array.isArray(data) ? data : []).map((t, idx) => {
        const id = t.id || t._id || (idx + 1);
        const template = templates[id] || {};
        // Merge so template fills missing fields but backend overrides if provided
        const merged = { id, ...template, ...t };
        if (!merged.sessions) {
          merged.sessions = merged.sessionCount ? `${merged.sessionCount}+ sessions` : 'Experienced professional';
        }
        if (!merged.price) {
          const fallbackPrices = ['₹2400 for 50 min','₹2500 for 50 min','₹2600 for 50 min','₹2700 for 50 min','₹2800 for 50 min','₹2900 for 50 min','₹3000 for 50 min','₹3200 for 50 min','₹3500 for 50 min'];
          merged.price = fallbackPrices[(id - 1) % fallbackPrices.length];
        }
        if (!merged.description) {
          merged.description = 'Compassionate, client-centered approach focusing on measurable improvement and well-being.';
        }
        if (!merged.languages) merged.languages = 'English';
        if (merged.verified === undefined) merged.verified = true;
        return merged;
      });
      setTherapists(enriched);
    } catch (err) {
      console.error('Error fetching therapists:', err);
      // Use enhanced mock data with professional profiles
      setTherapists([
        { 
          id: 1, 
          name: "Dr. Priya Naik", 
          specialty: "Cognitive Behavioral Therapy", 
          location: "Panaji, Goa", 
          availability: "Tomorrow, 06 Sep, 07:30 pm IST",
          experience: "5 years of experience",
          languages: "Fluent in English, Hindi, Konkani",
          rating: "Top-Rated",
          sessions: "120 happy client sessions",
          price: "₹2500 for 50 min",
          description: "Specialized in anxiety, depression, and stress management. I use evidence-based approaches to help you overcome life's challenges.",
          image: "../asserts/doc1.jpg",
          verified: true
        },
        { 
          id: 2, 
          name: "Dr. Rajesh Kamath", 
          specialty: "Trauma Therapy", 
          location: "Margao, Goa", 
          availability: "Today, 05 Sep, 08:00 pm IST",
          experience: "8 years of experience",
          languages: "Fluent in English, Hindi, Marathi",
          rating: "Top-Rated",
          sessions: "200+ happy client sessions",
          price: "₹3000 for 50 min",
          description: "Expert in trauma recovery and PTSD treatment. I provide a safe space for healing and growth.",
          image: "../asserts/doc2.jpg",
          verified: true
        },
        { 
          id: 3, 
          name: "Dr. Sneha D'Souza", 
          specialty: "Family Counseling", 
          location: "Vasco da Gama, Goa", 
          availability: "Tomorrow, 06 Sep, 06:00 pm IST",
          experience: "6 years of experience",
          languages: "Fluent in English, Hindi, Konkani",
          rating: "Highly Rated",
          sessions: "150 happy client sessions",
          price: "₹2800 for 50 min",
          description: "Focused on family dynamics, relationship counseling, and communication improvement.",
          image: "../asserts/doc3.jpg",
          verified: true
        },
        { 
          id: 4, 
          name: "Dr. Vikram Shetty", 
          specialty: "Depression & Anxiety", 
          location: "Mapusa, Goa", 
          availability: "Today, 05 Sep, 09:30 pm IST",
          experience: "7 years of experience",
          languages: "Fluent in English, Hindi, Kannada",
          rating: "Top-Rated",
          sessions: "180 happy client sessions",
          price: "₹2700 for 50 min",
          description: "Specializing in mood disorders with a compassionate, holistic approach to mental wellness.",
          image: "../asserts/doc4.jpg",
          verified: true
        },
        { 
          id: 5, 
          name: "Dr. Anisha Pai", 
          specialty: "Mindfulness Therapy", 
          location: "Ponda, Goa", 
          availability: "Tomorrow, 06 Sep, 05:30 pm IST",
          experience: "4 years of experience",
          languages: "Fluent in English, Hindi, Konkani",
          rating: "Highly Rated",
          sessions: "90 happy client sessions",
          price: "₹2400 for 50 min",
          description: "Integrating mindfulness and meditation techniques for stress reduction and emotional balance.",
          image: "../asserts/doc5.jpg",
          verified: true
        },
        { 
          id: 6, 
          name: "Dr. Sunita Verma", 
          specialty: "Child Psychology", 
          location: "Calangute, Goa", 
          availability: "Today, 05 Sep, 04:00 pm IST",
          experience: "9 years of experience",
          languages: "Fluent in English, Hindi, Punjabi",
          rating: "Top-Rated",
          sessions: "250+ happy client sessions",
          price: "₹3200 for 50 min",
          description: "Expert in child development, behavioral issues, and family support systems.",
          image: "../asserts/doc6.jpg",
          verified: true
        },
        { 
          id: 7, 
          name: "Dr. Manoj Prabhu", 
          specialty: "Addiction Counseling", 
          location: "Mangalore, Karnataka", 
          availability: "Tomorrow, 06 Sep, 07:00 pm IST",
          experience: "10 years of experience",
          languages: "Fluent in English, Hindi, Tulu",
          rating: "Top-Rated",
          sessions: "300+ happy client sessions",
          price: "₹3500 for 50 min",
          description: "Comprehensive addiction recovery programs with ongoing support and relapse prevention.",
          image: "../asserts/doc7.jpg",
          verified: true
        },
        {
          id: 8,
          name: "Ms. Anjali D'Souza",
          specialty: "College Counselor",
          college: "Padre Conceicao College Of Engineering",
          location: "Verna, Goa",
          availability: "Mon-Fri, 10:00 am - 4:00 pm",
          experience: "Student counseling, career guidance, mental wellness",
          languages: "English, Hindi, Konkani",
          rating: "Friendly & Supportive",
          sessions: "Available for all PCC students",
          price: "Free for PCC students",
          description: "Providing emotional support, academic guidance, and personal counseling for students at PCC.",
          image: "../asserts/doc8.jpg",
          verified: true
        },
        {
          id: 9,
          name: "Mr. Rohan Naik",
          specialty: "College Counselor",
          college: "Don Bosco College of Engineering",
          location: "Fatorda, Goa",
          availability: "Mon-Fri, 11:00 am - 5:00 pm",
          experience: "Student counseling, stress management, career advice",
          languages: "English, Hindi, Marathi",
          rating: "Approachable & Caring",
          sessions: "Available for all Don Bosco students",
          price: "Free for Don Bosco students",
          description: "Helping students manage stress, academic challenges, and personal issues at Don Bosco.",
          image: "../asserts/doc9.jpg",
          verified: true
        }
      ]);
    }
  };

  const openBookingModal = (therapist) => {
    setSelectedTherapist(therapist);
    setForm(prev => ({ ...prev, therapistId: therapist.id }));
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedTherapist(null);
    // Reset form
    setForm({ name: '', phone: '', datetime: '', concern: '', therapistId: '' });
  };

  const submitForm = async () => {
    if (!form.therapistId) {
      alert('Please select a therapist');
      return;
    }
    
    if (!form.name || !form.phone || !form.datetime) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsBooking(true);
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Find selected therapist to include name in the booking data
      const selectedTherapistData = therapists.find(t => t.id === form.therapistId);
      
      // Add therapist name, userId, userEmail to the booking data
      const bookingData = {
        ...form,
        therapistName: selectedTherapistData?.name || 'Unknown therapist',
        status: 'upcoming',
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'appointments'), bookingData);
      alert('Appointment booked successfully!');
      setForm({ name: '', phone: '', datetime: '', concern: '', therapistId: '' });
      closeBookingModal();
      fetchAppointments(); // Refresh appointments list
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

  // Sort appointments into upcoming and past
  const currentDate = new Date();
  const upcomingAppointments = appointments.filter(appt => new Date(appt.datetime) > currentDate)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime)); // Earliest first for upcoming

  const completedAppointments = appointments.filter(appt => new Date(appt.datetime) <= currentDate)
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime)); // Most recent first for completed

  if (loadingUser || loading) {
    return <div className="loading-container">Loading therapists...</div>;
  }

  if (!user) {
    return (
      <div className="error-message">
        <h3>Please log in to book a therapist</h3>
        <p>You need to be logged in to view and book appointments with our therapists.</p>
      </div>
    );
  }

  return (
    <div className="therapist-booking-page">
      <h2>Find Your Perfect Therapist</h2>
      
      <div className="therapists-section">
        <div className="therapists-grid-modern">
          {therapists.map((therapist) => (
            <div key={therapist.id} className="therapist-card-modern">
              {/** Compute base numeric price for couples calculation */}
              {(() => { return null; })()}
              <div className="therapist-header">
                <div className="rating-badges">
                  {therapist.verified && <span className="verified-badge">✓</span>}
                  <span className="rating-badge">{therapist.rating}</span>
                  <span className="sessions-badge">{therapist.sessions}</span>
                </div>
              </div>
              
              <div className="therapist-profile">
                <div className="therapist-avatar-modern">
                  <img 
                    src={therapist.image?.startsWith('http') ? therapist.image : require(`../asserts/${therapist.image.replace(/^\.\/|^\.\.\/(asserts\/)?/,'')}`)} 
                    alt={therapist.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar-fallback" style={{display: 'none'}}>
                    {therapist.name.charAt(0)}
                  </div>
                </div>
                
                <div className="therapist-details">
                  <h3 className="therapist-name">
                    {therapist.name}
                    {therapist.verified && <span className="verify-check">✓</span>}
                  </h3>
                  <p className="therapist-specialty">{therapist.specialty}</p>
                  <p className="therapist-experience">{therapist.experience}</p>
                  <p className="therapist-languages">{therapist.languages}</p>
                </div>
              </div>
              
              <div className="therapist-description">
                <p>{therapist.description}</p>
              </div>
              
              <div className="appointment-info">
                <div className="availability">
                  <div className="availability-time">
                    {therapist.availability}
                  </div>
                </div>
                
                <div className="pricing-booking">
                  <div className="pricing-info">
                    <div className="price-individual">
                      <strong>
                        Individuals: {therapist.price || 'Pricing on request'}
                      </strong>
                    </div>
                    <div className="price-couples">
                        {(() => {
                          if (therapist.id === 8 || therapist.id === 9) {
                            return 'Couples Session: Not applicable for college counselors';
                          }
                          if (!therapist.price) return 'Couples Session: Pricing on request';
                          const match = String(therapist.price).match(/(\d[\d,]*)/);
                          if (!match) return 'Couples Session: Pricing on request';
                          const base = parseInt(match[1].replace(/,/g, ''), 10);
                          if (Number.isNaN(base)) return 'Couples Session: Pricing on request';
                          return `Couples Session: ₹${base + 500} for 50 min`;
                        })()}
                    </div>
                  </div>
                  
                  <button 
                    className="book-session-btn"
                    onClick={() => openBookingModal(therapist)}
                  >
                    Book Your Session
                  </button>
                  
                  <div className="session-features">
                    <span className="feature">⚡ Instant Confirmation</span>
                    <span className="feature">📹 Google Meet</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={closeBookingModal}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book Appointment with {selectedTherapist?.name}</h3>
              <button className="close-btn" onClick={closeBookingModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="selected-therapist-info">
                <div className="therapist-avatar-small">
                  <img 
                    src={selectedTherapist?.image?.startsWith('http') ? selectedTherapist.image : require(`../asserts/${selectedTherapist?.image.replace(/^\.\/|^\.\.\/(asserts\/)?/,'')}`)} 
                    alt={selectedTherapist?.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar-fallback-small" style={{display: 'none'}}>
                    {selectedTherapist?.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4>{selectedTherapist?.name}</h4>
                  <p>{selectedTherapist?.specialty}</p>
                  <p className="price-highlight">{selectedTherapist?.price}</p>
                </div>
              </div>
              
              <div className="booking-form-modal">
                <div className="form-field">
                  <label htmlFor="modal-name">Full Name *</label>
                  <input
                    id="modal-name"
                    className="form-input"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="modal-phone">Phone Number *</label>
                  <input
                    id="modal-phone"
                    className="form-input"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                    required
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="modal-datetime">Preferred Date & Time *</label>
                  <input
                    id="modal-datetime"
                    className="form-input"
                    name="datetime"
                    value={form.datetime}
                    onChange={handleChange}
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="modal-concern">Your Concerns (Optional)</label>
                  <textarea
                    id="modal-concern"
                    className="form-textarea"
                    name="concern"
                    placeholder="Please describe your concerns briefly... This helps the therapist prepare for your session."
                    value={form.concern}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    onClick={closeBookingModal}
                    className="cancel-btn"
                    disabled={isBooking}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitForm}
                    disabled={isBooking || !form.name || !form.phone || !form.datetime}
                    className="confirm-booking-btn"
                  >
                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment History */}
      <div className="appointments-section">
        <h3>Your Appointments</h3>
        
        <div className="appointments-tabs">
          <div className="tab-content">
            <h4>Upcoming Appointments</h4>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appt) => {
                const therapist = therapists.find(t => t.id === appt.therapistId);
                const apptDate = new Date(appt.datetime);
                return (
                  <div key={appt.id} className="appointment-card upcoming">
                    <div className="appointment-status">Upcoming</div>
                    <div className="appointment-details">
                      <div className="detail-row">
                        <span className="label"><b>Therapist:</b></span>
                        <span className="value">{therapist?.name || appt.therapistName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label"><b>Date & Time:</b></span>
                        <span className="value">{apptDate.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label"><b>Patient:</b></span>
                        <span className="value">{appt.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label"><b>Phone:</b></span>
                        <span className="value">{appt.phone}</span>
                      </div>
                      {appt.concern && (
                        <div className="detail-row">
                          <span className="label"><b>Concerns:</b></span>
                          <span className="value">{appt.concern}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No upcoming appointments. Book your first session above!</p>
              </div>
            )}
          </div>

          <div className="tab-content">
            <h4>Completed Appointments</h4>
            {completedAppointments.length > 0 ? (
              completedAppointments.map((appt) => {
                const therapist = therapists.find(t => t.id === appt.therapistId);
                const apptDate = new Date(appt.datetime);
                return (
                  <div key={appt.id} className="appointment-card completed">
                    <div className="appointment-status completed-status">Completed</div>
                    <div className="appointment-details">
                      <div className="detail-row">
                        <span className="label"><b>Therapist:</b></span>
                        <span className="value">{therapist?.name || appt.therapistName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label"><b>Date & Time:</b></span>
                        <span className="value">{apptDate.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label"><b>Patient:</b></span>
                        <span className="value">{appt.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label"><b>Phone:</b></span>
                        <span className="value">{appt.phone}</span>
                      </div>
                      {appt.concern && (
                        <div className="detail-row">
                          <span className="label"><b>Concerns:</b></span>
                          <span className="value">{appt.concern}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No completed appointments yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTherapistPage;
