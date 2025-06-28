import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

const dummyAvailability = {
  doc001: [
    { date: '2025-07-01', time: '09:00' },
    { date: '2025-07-01', time: '10:00' },
    { date: '2025-07-02', time: '14:00' }
  ],
  doc002: [
    { date: '2025-07-03', time: '10:30' },
    { date: '2025-07-03', time: '12:00' }
  ]
};

export default function BookAppointment() {
  const { doctorId } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientInfo, setPatientInfo] = useState({ name: '', email: '' });

  const doctorName = doctorId === 'doc001' ? 'Dr. Arjun Patel' : 'Dr. Riya Sharma';
  const availability = dummyAvailability[doctorId] || [];

  // format availability to map by date
  const availableDates = availability.reduce((map, slot) => {
    if (!map[slot.date]) map[slot.date] = [];
    map[slot.date].push(slot.time);
    return map;
  }, {});

  const getTileDisabled = ({ date }) => {
    const formatted = date.toISOString().split('T')[0];
    return !availableDates[formatted];
  };

  const handleChange = (e) => {
    setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date: selectedDate,
      time: selectedSlot,
      ...patientInfo,
      doctorId,
      doctorName
    };
    try {
      await axios.post('http://localhost:5000/api/book', payload);
      alert('Appointment booked successfully!');
    } catch (err) {
      console.error(err);
      alert('Booking failed.');
    }
  };

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center fw-bold mb-4">Book Appointment with {doctorName}</h2>

        {/* Calendar Component */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-6">
            <Calendar
              onChange={(value) => {
                const selected = value.toISOString().split('T')[0];
                setSelectedDate(selected);
                setSelectedSlot(null);
              }}
              tileDisabled={getTileDisabled}
              value={selectedDate ? new Date(selectedDate) : null}
            />
          </div>
        </div>

        {/* Show available slots for selected date */}
        {selectedDate && availableDates[selectedDate] && (
          <>
            <h5 className="text-center mb-3">Available Time Slots on {selectedDate}</h5>
            <div className="row justify-content-center mb-4">
              {availableDates[selectedDate].map((time, i) => (
                <div key={i} className="col-md-3 mb-2">
                  <button
                    className={`btn w-100 rounded-pill ${selectedSlot === time ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => setSelectedSlot(time)}
                  >
                    {time}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Patient form */}
        {selectedSlot && (
          <form onSubmit={handleSubmit} className="w-50 mx-auto">
            <div className="mb-3">
              <input className="form-control" name="name" required placeholder="Your Name" onChange={handleChange} />
            </div>
            <div className="mb-3">
              <input className="form-control" name="email" type="email" required placeholder="Your Email" onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary w-100 rounded-pill">Confirm Appointment</button>
          </form>
        )}
      </div>
    </section>
  );
}
