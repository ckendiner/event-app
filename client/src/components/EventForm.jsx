import React, { useState } from "react";
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

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const organizerId = localStorage.getItem("organizerId");

      await axios.post(
        "https://event-app-ed9f.onrender.com/api/event",
        {
          ...formData,
          organizerId,
        }
      );
      setMessage("Event posted successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Error posting event");
    }
  };

  return (
    <div style={styles.page}>
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
            {formData.location.lat
              ? "Change Location"
              : "Pick Location on Map"}
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
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
    marginBottom: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },

  textarea: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    minHeight: "80px",
  },

  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },

  mapButton: {
    padding: "12px",
    background: "#e3f2fd",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  submitButton: {
    padding: "12px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  message: {
    textAlign: "center",
    marginBottom: "10px",
    color: "green",
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
    borderRadius: "10px",
    width: "90%",
    maxWidth: "700px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },

  cancel: {
    padding: "10px",
    background: "#ccc",
    border: "none",
    borderRadius: "6px",
  },

  confirm: {
    padding: "10px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
};

export default EventForm;