import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
    { date: '2025-07-03', time: '12:00' },
    { date: '2025-07-04', time: '12:00' },
    { date: '2025-07-06', time: '12:00' }
  ]
};

export default function BookAppointment() {
  const { doctorId } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const navigate = useNavigate();

  const patientInfo = {
    name: localStorage.getItem("name") || '',
    email: localStorage.getItem("email") || ''
  };

  const doctorName = doctorId === 'doc001' ? 'Dr. Arjun Patel' : 'Dr. Riya Sharma';
  const availability = dummyAvailability[doctorId] || [];

  const availableDates = availability.reduce((map, slot) => {
    if (!map[slot.date]) map[slot.date] = [];
    map[slot.date].push(slot.time);
    return map;
  }, {});

  const getTileDisabled = ({ date }) => {
    const formatted = date.toISOString().split('T')[0];
    return !availableDates[formatted];
  };

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/${doctorId}/${selectedDate}`);
        setBookedSlots(res.data.bookedSlots || []);
      } catch (err) {
        console.error("Failed to fetch booked slots", err);
      }
    };
    fetchBookedSlots();
  }, [selectedDate, doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientInfo.name || !patientInfo.email) {
      alert("Missing user details. Please log in again.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/book',
        {
          date: selectedDate,
          time: selectedSlot,
          doctorId,
          doctorName
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      alert('Appointment booked successfully!');
      navigate("/patient/dashboard");
    } catch (err) {
      console.error(err);
      alert('Booking failed.');
    }
  };

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center fw-bold mb-5">Book Appointment with {doctorName}</h2>

        <div className="row justify-content-center">
          {/* Calendar Column */}
          <div className="col-md-5 mb-4 mb-md-0">
            <div className="bg-white p-4 rounded shadow-sm">
              <Calendar
                onChange={(value) => {
                  const selected = value.toISOString().split('T')[0];
                  setSelectedDate(selected);
                  setSelectedSlot(null);
                }}
                tileDisabled={getTileDisabled}
                tileContent={({ date, view }) => {
                  const formatted = date.toISOString().split('T')[0];
                  if (view === 'month' && availableDates[formatted]) {
                    return (
                      <div className="text-success mt-1 text-center" style={{ fontSize: '0.8rem' }}>
                        ●
                      </div>
                    );
                  }
                  return null;
                }}
                value={selectedDate ? new Date(selectedDate) : null}
              />
            </div>
          </div>

          {/* Time Slots + Confirm Column */}
          <div className="col-md-5">
            <div className="bg-white p-4 rounded shadow-sm">
              {selectedDate ? (
                <>
                  <h5 className="mb-3 text-center">Available Time Slots on {selectedDate}</h5>
                  <div className="row">
                    {availableDates[selectedDate]?.map((time, i) => {
                      const isBooked = bookedSlots.includes(time);
                      return (
                        <div key={i} className="col-6 mb-3">
                          <button
                            className={`btn w-100 rounded-pill ${selectedSlot === time ? 'btn-dark' : 'btn-outline-dark'}`}
                            onClick={() => setSelectedSlot(time)}
                            disabled={isBooked}
                          >
                            {time} {isBooked && "(Booked)"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-muted text-center">Please select a date from the calendar.</p>
              )}

              {/* Confirm Button */}
              {selectedSlot && (
                <form onSubmit={handleSubmit} className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 rounded-pill"
                    disabled={!patientInfo.name || !patientInfo.email}
                  >
                    Confirm Appointment
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
