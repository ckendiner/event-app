import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleMap, Marker, Circle, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const HomePage = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedEventForMap, setSelectedEventForMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  // ✅ BLUE USER ICON
  const userIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  };

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

  
  /*
  //this is for debug, this one will shows all organizer
  //information in homepage console, need to remove
  useEffect(() => {
    console.log("EVENT FROM API:", events);
  }, [events]);
  */

  const hasValidLocation = (event) => {
    return (
      event &&
      event.location &&
      event.location.lat !== undefined &&
      event.location.lng !== undefined &&
      event.location.lat !== null &&
      event.location.lng !== null
    );
  };

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
          hasValidLocation(e) &&
          getDistance(
            userLocation.lat,
            userLocation.lng,
            e.location.lat,
            e.location.lng
          ) <= 10
      )
    : events.filter((e) => hasValidLocation(e));

  const getGoogleMapsUrl = (event) =>
    `https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}&travelmode=driving`;

  const handleLocationClick = (clickEvent, eventData) => {
    clickEvent.preventDefault();

    if (!hasValidLocation(eventData)) {
      alert("Location is not available for this event.");
      return;
    }

    setSelectedEventForMap(eventData);
  };

  const openGoogleMaps = () => {
    if (!selectedEventForMap) return;

    window.open(
      getGoogleMapsUrl(selectedEventForMap),
      "_blank",
      "noopener,noreferrer"
    );

    setSelectedEventForMap(null);
  };

  const debugDistance = (e) => {
    if (!userLocation || !hasValidLocation(e)) return null;

    return getDistance(
      userLocation.lat,
      userLocation.lng,
      e.location.lat,
      e.location.lng
    ).toFixed(2);
  };

  return (
    <div style={styles.page}>
      {/* HERO (UNCHANGED) */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Discover Events Near You</h1>
        <p style={styles.subtitle}>
          Find exciting events happening around you within 15km radius.
        </p>

        <button
          style={styles.ctaButton}
          onClick={() => navigate("/register")}
        >
          Become an Organizer
        </button>
      </div>

      {/* EVENTS (UNCHANGED) */}
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

                <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                <p>👤 {e.organizerId?.name}</p>
                <p>📧 {e.organizerId?.email}</p>
                <p>📱 {e.organizerId?.phone}</p>
              </div>

                <p style={styles.cardDesc}>
                  {e.description.substring(0, 80)}...
                </p>

                <p style={styles.date}>
                  📅 {new Date(e.date).toLocaleDateString()}
                </p>

                <p style={{ fontSize: "12px", color: "gray" }}>
                  Distance from you (in radius): {debugDistance(e)} km
                </p>

                <div style={styles.badges}>
                  {Array.isArray(e.categories) &&
                    e.categories.map((cat, i) => (
                      <span key={i} style={styles.badge}>
                        {cat}
                      </span>
                    ))}
                </div>

                <a
                  href={getGoogleMapsUrl(e)}
                  onClick={(clickEvent) =>
                    handleLocationClick(clickEvent, e)
                  }
                  style={styles.locationLink}
                >
                  📍 LOCATION
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAP (ONLY ADDITIONS HERE) */}
      {isLoaded && userLocation && (
        <div style={styles.mapSection}>
          <h2 style={styles.sectionTitle}>Event Locations</h2>

          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation}
            zoom={12}
          >
            {/* ✅ USER MARKER (BLUE) */}
            <Marker position={userLocation} icon={userIcon} />

            {/* ✅ 15KM RADIUS */}
            <Circle
              center={userLocation}
              radius={10000}
              options={{
                strokeColor: "#4facfe",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillOpacity: 0.025,
              }}
            />

            {/* EVENT MARKERS (UNCHANGED) */}
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

      {/* POPUP (UNCHANGED) */}
      {selectedEventForMap && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Open Google Maps?</h2>

            <p style={styles.modalText}>
              Do you want to open Google Maps for navigation to{" "}
              <strong>{selectedEventForMap.title}</strong>?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setSelectedEventForMap(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={openGoogleMaps}
                style={styles.openMapButton}
              >
                Open Google Maps
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

  locationLink: {
    display: "inline-block",
    marginTop: "14px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#4facfe",
    textDecoration: "underline",
    cursor: "pointer",
  },

  mapSection: {
    padding: "40px 20px",
    maxWidth: "1200px",
    margin: "auto",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  modal: {
    background: "#fff",
    width: "90%",
    maxWidth: "430px",
    padding: "28px",
    borderRadius: "14px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    textAlign: "center",
  },

  modalTitle: {
    marginBottom: "12px",
    color: "#333",
  },

  modalText: {
    color: "#555",
    fontSize: "15px",
    lineHeight: "1.5",
    marginBottom: "22px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  cancelButton: {
    padding: "11px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#ddd",
    color: "#333",
    fontWeight: "bold",
    cursor: "pointer",
  },

  openMapButton: {
    padding: "11px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#4facfe",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default HomePage;