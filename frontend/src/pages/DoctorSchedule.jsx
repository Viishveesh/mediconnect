// pages/DoctorSchedule.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const DoctorSchedule = () => {
  const { doctorId } = useParams();  // ⬅️ Gets doctorId from route
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/doctor/schedule?doctorId=${doctorId}`)
      .then(res => {
        const mappedEvents = res.data.map(slot => ({
          id: slot._id,
          title: slot.type === "available" ? "Available" : `Busy: ${slot.reason || "Unavailable"}`,
          start: slot.startTime,
          end: slot.endTime,
          backgroundColor: slot.type === "available" ? "#4CAF50" : "#FF5252",
          borderColor: "#000",
          textColor: "#fff"
        }));
        setEvents(mappedEvents);
      })
      .catch(err => {
        console.error("Error fetching schedule", err);
      });
  }, [doctorId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Doctor Schedule</h2>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        allDaySlot={false}
      />
    </div>
  );
};

export default DoctorSchedule;