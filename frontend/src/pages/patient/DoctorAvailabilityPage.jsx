import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DoctorAvailabilityPage = () => {
  const { doctorId } = useParams();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/doctors/${doctorId}/availability`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailability(res.data);
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [doctorId]);

  return (
    <div className="container py-4">
      <h2>Doctor Availability</h2>
      {loading ? (
        <p>Loading...</p>
      ) : availability.length === 0 ? (
        <p>No available slots</p>
      ) : (
        <ul className="list-group">
          {availability.map((slot, idx) => (
            <li key={idx} className="list-group-item">
              🕐 {new Date(slot.startTime).toLocaleString()} – {new Date(slot.endTime).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorAvailabilityPage;
