import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const HomePage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setUserLocation({ lat: 3.139, lng: 101.6869 });
      }
    );
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "https://event-app-ed9f.onrender.com/api/events"
        );
        setEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const nearbyEvents = userLocation
    ? events.filter(
        (e) =>
          getDistance(
            userLocation.lat,
            userLocation.lng,
            e.location.lat,
            e.location.lng
          ) <= 15
      )
    : events;

  return (
    <div style={styles.page}>
      
      {/* HERO */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Discover Events Near You</h1>
        <p style={styles.subtitle}>
          Find exciting events happening around you within 15km.
        </p>

        <button
          style={styles.ctaButton}
          onClick={() => navigate("/register")}
        >
          Become an Organizer
        </button>
      </div>

      {/* EVENTS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Nearby Events</h2>

        {loading ? (
          <p>Loading events...</p>
        ) : nearbyEvents.length === 0 ? (
          <p>No events found nearby.</p>
        ) : (
          <div style={styles.grid}>
            {nearbyEvents.map((e) => (
              <div key={e._id} style={styles.card}>
                <h3 style={styles.cardTitle}>{e.title}</h3>

                <p style={styles.cardDesc}>
                  {e.description.substring(0, 80)}...
                </p>

                <p style={styles.date}>
                  📅 {new Date(e.date).toLocaleDateString()}
                </p>

                <div style={styles.badges}>
                  {e.categories.map((cat, i) => (
                    <span key={i} style={styles.badge}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAP */}
      {isLoaded && userLocation && (
        <div style={styles.mapSection}>
          <h2 style={styles.sectionTitle}>Event Locations</h2>

          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation}
            zoom={12}
          >
            {nearbyEvents.map((e) => (
              <Marker
                key={e._id}
                position={{
                  lat: e.location.lat,
                  lng: e.location.lng,
                }}
              />
            ))}
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "Segoe UI, sans-serif",
    background: "#f4f6f8",
    minHeight: "100vh",
  },

  hero: {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #4facfe, #00f2fe)",
    color: "white",
  },

  title: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "18px",
    marginBottom: "20px",
  },

  ctaButton: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    background: "#fff",
    color: "#333",
    fontWeight: "bold",
    cursor: "pointer",
  },

  section: {
    padding: "40px 20px",
    maxWidth: "1200px",
    margin: "auto",
  },

  sectionTitle: {
    fontSize: "26px",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  cardTitle: {
    marginBottom: "10px",
  },

  cardDesc: {
    fontSize: "14px",
    color: "#555",
  },

  date: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#888",
  },

  badges: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },

  badge: {
    background: "#e0f7fa",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
  },

  mapSection: {
    padding: "40px 20px",
    maxWidth: "1200px",
    margin: "auto",
  },
};

export default HomePage;