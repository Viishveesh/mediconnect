import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import Modal from "react-modal";
// import "../assets/css/styles.css"; // Your provided modal + button CSS

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotData, setSlotData] = useState({
    startTime: "",
    endTime: "",
    type: "available",
    reason: "",
  });

  useEffect(() => {
    // Ensures modal works after DOM loads
    Modal.setAppElement("#root");

    // Fetch availability + busy slots (combined route)
    axios
      .get(`http://localhost:5000/doctor/schedule?doctorId=${doctorId}`)
      .then((res) => {
        const mappedEvents = res.data.map((slot) => ({
          id: slot._id,
          title:
            slot.type === "available"
              ? "Available"
              : `Busy: ${slot.reason || "Unavailable"}`,
          start: slot.startTime,
          end: slot.endTime,
          backgroundColor: slot.type === "available" ? "#4CAF50" : "#FF5252",
          borderColor: "#000",
          textColor: "#fff",
        }));
        setEvents(mappedEvents);
      })
      .catch((err) => {
        console.error("Error fetching schedule", err);
      });
  }, [doctorId]);

  const handleAddSlotClick = () => {
    // Clear previous slot data before showing modal
    setSlotData({
      startTime: "",
      endTime: "",
      type: "available",
      reason: "",
    });
    setIsModalOpen(true);
  };

  const handleSlotSelect = (info) => {
    // Pre-fill modal with selected slot time
    setSlotData({
      startTime: info.startStr,
      endTime: info.endStr,
      type: "available",
      reason: "",
    });
    setIsModalOpen(true);
  };

  const handleAddSlot = async () => {
    try {
      await axios.post("http://localhost:5000/doctor/availability", {
        doctorId,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        type: slotData.type,
        reason: slotData.reason,
      });
      setIsModalOpen(false);
      setSlotData({
        startTime: "",
        endTime: "",
        type: "available",
        reason: "",
      });
      window.location.reload(); // Refresh events
    } catch (err) {
      console.error("Failed to add slot", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Doctor Schedule</h2>

      <button className="add-slot-btn" onClick={() => setIsModalOpen(true)} >
        + Add Slot
      </button>

      <div style={{ height: "500px", overflowY: "hidden" }}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          height="100%"
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          selectable={true}
          select={handleSlotSelect}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="modal-overlay"
        className="modal-content"
      >
        <h3>Add Availability Slot</h3>
        <form>
          <label>Start Time:</label>
          <input
            type="datetime-local"
            name="startTime"
            value={slotData.startTime}
            onChange={(e) =>
              setSlotData({ ...slotData, startTime: e.target.value })
            }
          />

          <label>End Time:</label>
          <input
            type="datetime-local"
            name="endTime"
            value={slotData.endTime}
            onChange={(e) =>
              setSlotData({ ...slotData, endTime: e.target.value })
            }
          />

          <label>Type:</label>
          <select
            name="type"
            value={slotData.type}
            onChange={(e) => setSlotData({ ...slotData, type: e.target.value })}
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>

          {slotData.type === "busy" && (
            <>
              <label>Reason:</label>
              <input
                type="text"
                name="reason"
                value={slotData.reason}
                onChange={(e) =>
                  setSlotData({ ...slotData, reason: e.target.value })
                }
              />
            </>
          )}

          <div className="modal-buttons">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="modal-cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSlot}
              className="modal-save"
            >
              Save Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorSchedule;
