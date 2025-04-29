import React, { useState } from 'react';
import axios from 'axios';
const BookTherapistPage = () => {
  const [form, setForm] = useState({ name: '', time: '', concern: '' });

  const submitForm = async () => {
    await axios.post('http://localhost:8000/book', form);
    alert('Appointment booked!');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Book a Therapist</h2>
      <input className="block mb-2 border p-1 w-full" placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="block mb-2 border p-1 w-full" placeholder="Time" onChange={(e) => setForm({ ...form, time: e.target.value })} />
      <textarea className="block mb-2 border p-1 w-full" placeholder="Your concern..." onChange={(e) => setForm({ ...form, concern: e.target.value })} />
      <button onClick={submitForm} className="bg-blue-600 text-white px-4 py-1">Submit</button>
    </div>
  );
};
export default BookTherapistPage;