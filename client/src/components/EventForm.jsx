import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const API_BASE_URL = "https://event-app-ed9f.onrender.com/api";

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
  const [myEvents, setMyEvents] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const organizerId = localStorage.getItem("organizerId");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingEvents = myEvents.filter((event) => {
    return new Date(event.date) >= todayStart;
  });

  const pastEvents = myEvents.filter((event) => {
    return new Date(event.date) < todayStart;
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      categories: [],
      location: { lat: null, lng: null },
    });

    setSelectedPosition(null);
    setIsEditing(false);
    setEditingEventId(null);
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toISOString().split("T")[0];
  };

  const fetchMyEvents = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/events`);

      const filtered = res.data.filter((event) => {
        const eventOrganizerId = event.organizerId?._id || event.organizerId;
        return eventOrganizerId === organizerId;
      });

      setMyEvents(filtered);
    } catch (err) {
      console.error("Error fetching events:", err.response?.data || err.message);
    }
  }, [organizerId]);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

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

  const handleEditClick = (event) => {
    const eventLocation = {
      lat: event.location?.lat ?? null,
      lng: event.location?.lng ?? null,
    };

    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: formatDateForInput(event.date),
      categories: Array.isArray(event.categories) ? event.categories : [],
      location: eventLocation,
    });

    setSelectedPosition(eventLocation);
    setIsEditing(true);
    setEditingEventId(event._id);
    setMessage(`Editing: ${event.title}`);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage("");
  };

  const handleDeleteClick = async (event) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmDelete) return;

    const token = getToken();

    if (!token) {
      setMessage("Please login again. Token not found.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/delete/event/${event._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Event deleted successfully!");

      if (editingEventId === event._id) {
        resetForm();
      }

      await fetchMyEvents();
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        setMessage("Invalid token. Please logout, login again, then try again.");
      } else if (err.response?.status === 403) {
        setMessage("You are not allowed to delete this event.");
      } else {
        setMessage(err.response?.data?.message || "Error deleting event");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      setMessage("Please login again. Token not found.");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      categories: formData.categories,
      location: {
        lat: Number(formData.location.lat),
        lng: Number(formData.location.lng),
      },
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/update/event/${editingEventId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessage("Event updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/event`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessage("Event posted successfully!");
      }

      await fetchMyEvents();
      resetForm();
    } catch (err) {
      console.error("EVENT SAVE ERROR:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        setMessage("Invalid token. Please logout, login again, then try again.");
      } else {
        setMessage(err.response?.data?.message || "Error saving event");
      }
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

  const renderEventCard = (event) => (
    <div key={event._id} style={styles.eventCard}>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>{new Date(event.date).toLocaleDateString()}</p>

      <div>
        {Array.isArray(event.categories) &&
          event.categories.map((c, i) => (
            <span key={i} style={styles.badge}>
              {c}
            </span>
          ))}
      </div>

      <div style={styles.cardActions}>
        <button
          type="button"
          onClick={() => handleEditClick(event)}
          style={styles.editButton}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => handleDeleteClick(event)}
          style={styles.deleteButton}
        >
          Delete
        </button>

        <button
          type="button"
          onClick={(e) => handleLocationClick(e, event)}
          style={styles.locationButton}
        >
          Event Venue
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          {isEditing ? "Edit Event" : "Create New Event"}
        </h1>

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
            {isEditing ? "Update Event" : "Post Event"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={styles.cancelEditButton}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div style={styles.container}>
        <h2 style={styles.title}>🟢 Upcoming Events</h2>

        {upcomingEvents.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          upcomingEvents.map((event) => renderEventCard(event))
        )}
      </div>

      <div style={styles.container}>
        <h2 style={styles.title}>🔴 Past Events</h2>

        {pastEvents.length === 0 ? (
          <p>No past events.</p>
        ) : (
          pastEvents.map((event) => renderEventCard(event))
        )}
      </div>

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
                type="button"
                onClick={() => setMapOpen(false)}
                style={styles.cancel}
              >
                Cancel
              </button>

              <button type="button" onClick={confirmLocation} style={styles.confirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  message: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
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
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelEditButton: {
    padding: "10px",
    background: "#ddd",
    color: "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
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
  cardActions: {
    marginTop: "12px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  editButton: {
    padding: "8px 12px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },
  deleteButton: {
    padding: "8px 12px",
    background: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },
  locationButton: {
    padding: "8px 12px",
    background: "#fff",
    color: "#4facfe",
    border: "1px solid #4facfe",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
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
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    width: "80%",
    maxWidth: "600px",
    borderRadius: "12px",
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
};

export default EventForm;