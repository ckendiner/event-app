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
    location: { lat: null, lng: null, address: "" },
  });

  const [message, setMessage] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [myEvents, setMyEvents] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // NEW: collapsible sections
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showPast, setShowPast] = useState(false);

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

  const getAuthHeaders = useCallback(() => {
    const token = getToken();

    if (!token) {
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      categories: [],
      location: { lat: null, lng: null, address: "" },
    });

    setSelectedPosition(null);
    setIsEditing(false);
    setEditingEventId(null);
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toISOString().split("T")[0];
  };

  const validateForm = () => {
    const lat = Number(formData.location.lat);
    const lng = Number(formData.location.lng);

    if (!formData.title.trim()) {
      setMessage("Please enter event title.");
      return false;
    }

    if (!formData.description.trim()) {
      setMessage("Please enter event description.");
      return false;
    }

    if (!formData.date) {
      setMessage("Please select event date.");
      return false;
    }

    if (!Array.isArray(formData.categories) || formData.categories.length === 0) {
      setMessage("Please select at least one category.");
      return false;
    }

    if (
      formData.location.lat === null ||
      formData.location.lng === null ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setMessage("Please pick event location on the map.");
      return false;
    }

    return true;
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
      console.error("Error fetching my events:", err.response?.data || err.message);
      setMessage("Error fetching your events.");
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
    if (!selectedPosition) {
      setMessage("Please click on the map to select location.");
      return;
    }

    setFormData({
      ...formData,
      location: {
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
        address: "",
      },
    });

    setMapOpen(false);
  };

  const handleEditClick = (event) => {
    const eventLocation = {
      lat: event.location?.lat ?? null,
      lng: event.location?.lng ?? null,
      address: event.location?.address || "",
    };

    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: formatDateForInput(event.date),
      categories: Array.isArray(event.categories) ? event.categories : [],
      location: eventLocation,
    });

    setSelectedPosition({
      lat: Number(eventLocation.lat),
      lng: Number(eventLocation.lng),
    });

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

    const headers = getAuthHeaders();

    if (!headers) {
      setMessage("Please login again. Token not found.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/delete/event/${event._id}`, {
        headers,
      });

      setMessage("Event deleted successfully!");

      if (editingEventId === event._id) {
        resetForm();
      }

      await fetchMyEvents();
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        setMessage("Login expired. Please login again.");
      } else {
        setMessage(err.response?.data?.message || "Error deleting event");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const headers = getAuthHeaders();

    if (!headers) {
      setMessage("Please login again. Token not found.");
      return;
    }

    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      categories: formData.categories,
      location: {
        lat: Number(formData.location.lat),
        lng: Number(formData.location.lng),
        address: formData.location.address || "",
      },
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/update/event/${editingEventId}`, payload, {
          headers,
        });

        setMessage("Event updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/event`, payload, {
          headers,
        });

        setMessage("Event posted successfully!");
      }

      await fetchMyEvents();
      resetForm();
    } catch (err) {
      console.error("EVENT SAVE ERROR:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        setMessage("Login expired. Please login again.");
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
      <div style={styles.headerr}>
        <h1 style={styles.tajuk}>Organizer Dashboard</h1>
      </div>

      {/* TOP: EVENT FORM */}
      <div style={styles.formContainer}>
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
            {formData.location.lat !== null ? "Change Location" : "Pick Location"}
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

      {/* BELOW: INCOMING EVENTS COLLAPSIBLE */}
      <div style={styles.sectionContainer}>
        <button
          type="button"
          onClick={() => setShowUpcoming(!showUpcoming)}
          style={styles.sectionHeader}
        >
          <span>🟢 Incoming Events ({upcomingEvents.length})</span>
          <span>{showUpcoming ? "▲" : "▼"}</span>
        </button>

        {showUpcoming && (
          <div style={styles.sectionContent}>
            {upcomingEvents.length === 0 ? (
              <p>No incoming events.</p>
            ) : (
              <div style={styles.eventGrid}>
                {upcomingEvents.map((event) => renderEventCard(event))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BELOW: PAST EVENTS COLLAPSIBLE */}
      <div style={styles.sectionContainer}>
        <button
          type="button"
          onClick={() => setShowPast(!showPast)}
          style={styles.sectionHeader}
        >
          <span>🔴 Past Events ({pastEvents.length})</span>
          <span>{showPast ? "▲" : "▼"}</span>
        </button>

        {showPast && (
          <div style={styles.sectionContent}>
            {pastEvents.length === 0 ? (
              <p>No past events.</p>
            ) : (
              <div style={styles.eventGrid}>
                {pastEvents.map((event) => renderEventCard(event))}
              </div>
            )}
          </div>
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
    headerr: {
      textAlign: "center",
      padding: "60px 20px",
      background: "linear-gradient(135deg, #4facfe, #00f2fe)",
      color: "white",
    },
    tajuk: {
      fontSize: "42px",
      marginBottom: "10px",
    },
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "30px 20px",
  },
  formContainer: {
    width: "100%",
    maxWidth: "760px",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  sectionContainer: {
    width: "100%",
    maxWidth: "1000px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  sectionHeader: {
    width: "100%",
    padding: "18px 22px",
    background: "#ffffff",
    border: "none",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#333",
  },
  sectionContent: {
    padding: "20px",
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
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
    padding: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
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