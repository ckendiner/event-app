import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
const containerStyle = {
  width: "100%",
  height: "400px",
};
const defaultCenter = {
  lat: 3.139,
  lng: 101.6869,
};
const categoryOptions = ["Music", "Food", "Sports", "Workshop", "Art"];
const EventForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    categories: [],
    location: { lat: null, lng: null },
  });
  const [message, setMessage] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  // ✅ NEW: store events
  const [myEvents, setMyEvents] = useState([]);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      // upcoming (today + future)
      const upcomingEvents = myEvents.filter((event) => {
        return new Date(event.date) >= todayStart;
      });
      
      // past events
      const pastEvents = myEvents.filter((event) => {
        return new Date(event.date) < todayStart;
      });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  const organizerId = localStorage.getItem("organizerId");
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
    setFormData({ ...formData, categories: selected });
  };
  const handleMapClick = (e) => {
    setSelectedPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };
  const confirmLocation = () => {
    if (selectedPosition) {
      setFormData({
        ...formData,
        location: selectedPosition,
      });
      setMapOpen(false);
    }
  };
  // ✅ FETCH EVENTS (NEW)
  const fetchMyEvents = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://event-app-ed9f.onrender.com/api/events",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      const filtered = res.data.filter(
        (event) => event.organizerId?._id === organizerId
      );
  
      setMyEvents(filtered);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  }, [organizerId]);
  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      "https://event-app-ed9f.onrender.com/api/event",
      {
        ...formData,
        organizerId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setMessage("Event posted successfully!");
    fetchMyEvents();
    setFormData({
      title: "",
      description: "",
      date: "",
      categories: [],
      location: { lat: null, lng: null },
    });
  } catch (err) {
    console.error("POST ERROR:", err.response?.data || err.message);
    setMessage(err.response?.data?.message || "Error posting event");
  }

};

const getGoogleMapsUrl = (event) =>
  `https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}&travelmode=driving`;

const handleLocationClick = (e, eventData) => {
  e.preventDefault();
  e.stopPropagation();

  if (!eventData.location?.lat || !eventData.location?.lng) return;

  window.open(getGoogleMapsUrl(eventData), "_blank", "noopener,noreferrer");
};

  return (
    <div style={styles.page}>
  
      {/* LEFT / FORM SECTION */}
      <div style={styles.container}>
        <h1 style={styles.title}>Create New Event</h1>
  
        {message && <p style={styles.message}>{message}</p>}
  
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            style={styles.input}
          />
  
          <textarea
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleChange}
            style={styles.textarea}
          />
  
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={styles.input}
          />
  
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            style={styles.mapButton}
          >
            {formData.location.lat ? "Change Location" : "Pick Location"}
          </button>
  
          <select
            multiple
            value={formData.categories}
            onChange={handleCategoryChange}
            style={styles.select}
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
  
          <button type="submit" style={styles.submitButton}>
            Post Event
          </button>
        </form>
      </div>
  
      {/* RIGHT / EVENTS SECTION */}
      <div style={styles.container}>
        <h2 style={styles.title}>🟢 Upcoming Events</h2>

        {upcomingEvents.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          upcomingEvents.map((event) => (
            <div key={event._id} style={styles.eventCard}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>{new Date(event.date).toLocaleDateString()}</p>

              <div>
                {event.categories.map((c, i) => (
                  <span key={i} style={styles.badge}>
                    {c}
                  </span>
                ))}
              </div>

                <button
                onClick={(e) => handleLocationClick(e, event)}
                style={styles.locationLink}
                >
                Event Venue
                </button>
            </div>
          ))
        )}
      </div>

      {/* PAST EVENTS SECTION */}
      <div style={styles.container}>
        <h2 style={styles.title}>🔴 Past Events</h2>

        {pastEvents.length === 0 ? (
          <p>No past events.</p>
        ) : (
          pastEvents.map((event) => (
            <div key={event._id} style={styles.eventCard}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>{new Date(event.date).toLocaleDateString()}</p>

              <div>
                {event.categories.map((c, i) => (
                  <span key={i} style={styles.badge}>
                    {c}
                  </span>
                ))}
              </div>
                <button
                  onClick={(e) => handleLocationClick(e, event)}
                  style={styles.locationLink}
                >
                  EVENT LOCATION
                </button>
            </div>
          ))
        )}
      </div>
  
      {/* MAP MODAL */}
      {mapOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Select Location</h2>
            {!isLoaded ? (
              <p>Loading map...</p>
            ) : (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={selectedPosition || defaultCenter}
                zoom={12}
                onClick={handleMapClick}
              >
                {selectedPosition && <Marker position={selectedPosition} />}
              </GoogleMap>
            )}
            <div style={styles.modalActions}>
              <button
                onClick={() => setMapOpen(false)}
                style={styles.cancel}
              >
                Cancel
              </button>
              <button onClick={confirmLocation} style={styles.confirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "20px",
    padding: "20px",
  },
  container: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  textarea: {
    padding: "10px",
    minHeight: "80px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  mapButton: {
    padding: "10px",
    background: "#e3f2fd",
    border: "none",
    borderRadius: "6px",
  },
  submitButton: {
    padding: "10px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
  },
  eventCard: {
    padding: "10px",
    border: "1px solid #ddd",
    marginBottom: "10px",
    borderRadius: "8px",
  },
  badge: {
    background: "#e0f7fa",
    padding: "3px 8px",
    marginRight: "5px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: "20px",
    width: "80%",
    maxWidth: "600px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },
  cancel: {
    padding: "8px",
  },
  confirm: {
    padding: "8px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
  },
  locationLink: {
    display: "inline-block",
    marginTop: "10px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#4facfe",
    textDecoration: "underline",
    cursor: "pointer",
  },
};
export default EventForm;