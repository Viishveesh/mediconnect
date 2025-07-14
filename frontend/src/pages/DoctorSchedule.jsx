import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import Modal from "react-modal";
import "../assets/css/styles.css";

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const jwtToken = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotData, setSlotData] = useState({
    startTime: "",
    endTime: "",
    type: "available",
    reason: "",
  });

  useEffect(() => {
    Modal.setAppElement("#root");
    fetchSchedule();
  }, [doctorId]);

  const fetchSchedule = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/doctor/schedule?doctorId=${doctorId}`
      );
      const mappedEvents = res.data.map((slot) => ({
        id: slot._id,
        title:
          slot.type === "available"
            ? "Available"
            : `Busy: ${slot.reason || "Unavailable"}`,
        start: slot.startTime,
        end: slot.endTime,
        backgroundColor: slot.type === "available" ? "#38A169" : "#E53E3E",
        borderRadius: "8px",
        borderColor: "#ccc",
        textColor: "#ffffff",
      }));
      setEvents(mappedEvents);
    } catch (err) {
      console.error("Error fetching schedule", err);
    }
  };

  const resetSlotData = () => {
    setSlotData({
      startTime: "",
      endTime: "",
      type: "available",
      reason: "",
    });
  };

  const formatToLocalDateTime = (isoString) => {
    const local = new Date(isoString);
    const offset = local.getTimezoneOffset();
    local.setMinutes(local.getMinutes() - offset);
    return local.toISOString().slice(0, 16);
  };

  const handleSlotSelect = (info) => {
    const start = formatToLocalDateTime(info.startStr);
    const end = formatToLocalDateTime(info.endStr);

    setSlotData({
      startTime: start,
      endTime: end,
      type: "available",
      reason: "",
    });

    setIsModalOpen(true);
  };

  const handleAddSlotClick = () => {
    resetSlotData();
    setIsModalOpen(true);
  };

  const handleAddSlot = async () => {
    try {
      const endpoint =
        slotData.type === "available"
          ? "http://localhost:5000/doctor/availability"
          : "http://localhost:5000/doctor/busy";

      await axios.post(endpoint, {
        doctorId,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        reason: slotData.reason, // for busy, optional for available
      });

      setIsModalOpen(false);
      resetSlotData();
      fetchSchedule(); // reload calendar slots without full reload
    } catch (err) {
      console.error("Failed to add slot", err);
    }
  };

  const handleEventClick = async (info) => {
    const { id, extendedProps, title } = info.event;
    const isBusy = title.toLowerCase().includes("busy");

    if (
      window.confirm(
        `Do you want to delete this ${isBusy ? "busy" : "available"} slot?`
      )
    ) {
      try {
        const endpoint = isBusy
          ? `http://localhost:5000/doctor/busy/${id}`
          : `http://localhost:5000/doctor/availability/${id}`;

        await axios.delete(endpoint);
        fetchSchedule(); // re-fetch the schedule without reloading the page
      } catch (err) {
        console.error("Failed to delete slot", err);
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Doctor Schedule</h2>
      <div>
        <button className="add-slot-btn" onClick={handleAddSlotClick}>
          + Add Slot
        </button>

        <button
          className="google-sync-btn"
          onClick={() => {
            const token = localStorage.getItem("token");
            window.location.href = `http://localhost:5000/google/login?token=${token}`;
          }}
        >
          Connect Google Calendar
        </button>

        <button
          className="google-sync-btn"
          onClick={async () => {
            try {
              const res = await fetch(
                "http://localhost:5000/google/sync-busy",
                {
                  headers: {
                    Authorization: `Bearer ${jwtToken}`, // Make sure it's fresh
                  },
                }
              );
              const data = await res.json();
              alert(data.message || "Sync complete");
              fetchSchedule(); // reload calendar
            } catch (err) {
              console.error("Google sync failed", err);
              alert("Google Calendar sync failed.");
            }
          }}
        >
          Sync Busy Slots
        </button>
      </div>
      <div
        style={{
          height: "500px",
          overflowY: "hidden",
          display: "flex",
          justifyContent: "center",
          paddingBottom: "30px",
          paddingTop: "10px",
        }}
      >
        <div
          style={{
            width: "95%",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            padding: "20px",
          }}
        >
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            height="100%"
            slotMinTime="07:00:00"
            slotMaxTime="21:00:00"
            allDaySlot={false}
            selectable={true}
            eventOverlap={false}
            select={handleSlotSelect}
            eventClick={handleEventClick}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          resetSlotData();
          setIsModalOpen(false);
        }}
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
              onClick={() => {
                resetSlotData();
                setIsModalOpen(false);
              }}
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
