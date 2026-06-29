
// MERN-STACK/client/src/components/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  GoogleMap,
  Marker,
  Circle,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
const containerStyle = {
  width: "100%",
  height: "400px",
};
const HomePage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  // Popup for LOCATION button
  const [selectedEventForMap, setSelectedEventForMap] = useState(null);
  // Popup for email / phone click
  const [selectedContact, setSelectedContact] = useState(null);
  // Floating card when hovering red marker
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  // Blue user icon
  const userIcon = {
    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
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
          "https://event-app-ed9f.onrender.com/api/events/events"
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
  const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

// this part will prevent system show past event
const upcomingEvents = events.filter((e) => {
  if (!hasValidLocation(e)) return false;

  const eventDate = new Date(e.date);

  // keep only today + future
  return eventDate >= todayStart;
});

// 2. apply 10km filter
const nearbyEvents = userLocation
  ? upcomingEvents.filter((e) =>
      getDistance(
        userLocation.lat,
        userLocation.lng,
        e.location.lat,
        e.location.lng
      ) <= 10
    )
  : upcomingEvents;
  const getGoogleMapsUrl = (event) =>
    `https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}&travelmode=driving`;
  const handleLocationClick = (clickEvent, eventData) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    if (!hasValidLocation(eventData)) {
      alert("Location is not available for this event.");
      return;
    }
    setSelectedContact(null);
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
  const handleContactClick = (clickEvent, type, value, eventTitle) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    if (!value) {
      alert("Contact information is not available.");
      return;
    }
    setSelectedEventForMap(null);
    setSelectedContact({
      type,
      value,
      eventTitle,
    });
  };
  const openContactLink = () => {
    if (!selectedContact) return;
    if (selectedContact.type === "email") {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        selectedContact.value
      )}`;
      window.open(gmailUrl, "_blank", "noopener,noreferrer");
    }
    if (selectedContact.type === "phone") {
      const phoneNumber = selectedContact.value.replace(/[^\d+]/g, "");
      window.location.href = `tel:${phoneNumber}`;
    }
    setSelectedContact(null);
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
  const renderEventContent = (eventData, isMapPopup = false) => {
    const organizer = eventData.organizerId || {};
    const descriptionText =
      eventData.description || "No description available.";
    const maxDescriptionLength = isMapPopup ? 70 : 80;
    const shortDescription =
      descriptionText.length > maxDescriptionLength
        ? `${descriptionText.substring(0, maxDescriptionLength)}...`
        : descriptionText;
    return (
      <>
        <h3 style={isMapPopup ? styles.infoWindowTitle : styles.cardTitle}>
          {eventData.title}
        </h3>
        <div style={styles.organizerBox}>
          <p style={styles.organizerName}>Organizer:{" "}
            {organizer.name || "Organizer name not available"}
          </p>
          <p style={styles.contactLine}>
            <span style={styles.contactLabel}>Email: </span>
            {organizer.email ? (
              <a
                href={`mailto:${organizer.email}`}
                onClick={(clickEvent) =>
                  handleContactClick(
                    clickEvent,
                    "email",
                    organizer.email,
                    eventData.title
                  )
                }
                style={styles.contactLink}
              >
                {organizer.email}
              </a>
            ) : (
              <span style={styles.mutedText}>Email not available</span>
            )}
          </p>
          <p style={styles.contactLine}>
            <span style={styles.contactLabel}>Phone: </span>
            {organizer.phone ? (
              <a
                href={`tel:${organizer.phone}`}
                onClick={(clickEvent) =>
                  handleContactClick(
                    clickEvent,
                    "phone",
                    organizer.phone,
                    eventData.title
                  )
                }
                style={styles.contactLink}
              >
                {organizer.phone}
              </a>
            ) : (
              <span style={styles.mutedText}>Phone not available</span>
            )}
          </p>
        </div>
        <p style={styles.cardDesc}>{shortDescription}</p>
        <p style={styles.date}>
          {eventData.date
            ? new Date(eventData.date).toLocaleDateString()
            : "Date not available"}
        </p>
        <p style={styles.distanceText}>
          Distance from you: {debugDistance(eventData) || "-"} km
        </p>
        <div style={styles.badges}>
          {Array.isArray(eventData.categories) &&
            eventData.categories.map((cat, i) => (
              <span key={i} style={styles.badge}>
                {cat}
              </span>
            ))}
        </div>
        <a
          href={hasValidLocation(eventData) ? getGoogleMapsUrl(eventData) : "#"}
          onClick={(clickEvent) => handleLocationClick(clickEvent, eventData)}
          style={styles.locationLink}
        >
          Event Venue
        </a>
      </>
    );
  };
  return (
    <div style={styles.page}>
      {/* HERO */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Discover Events Near You</h1>
        <p style={styles.subtitle}>
          Find exciting events happening around you within 10km radius.
        </p>
        <button style={styles.ctaButton} onClick={() => navigate("/register")}>
          Post Your Own Event Here
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
                {renderEventContent(e, false)}
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
            onClick={() => setHoveredEvent(null)}
          >
            {/* USER MARKER */}
            <Marker position={userLocation} icon={userIcon} />
            {/* 10KM RADIUS */}
            <Circle
              center={userLocation}
              radius={10000} //tukaq benda ni kalau nak besarkan circle radius kat map
              options={{
                strokeColor: "#4facfe",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillOpacity: 0.025,
              }}
            />
            {/* EVENT MARKERS */}
            {nearbyEvents.map((e) => (
              <Marker
                key={e._id}
                position={{
                  lat: e.location.lat,
                  lng: e.location.lng,
                }}
                onMouseOver={() => setHoveredEvent(e)}
                onClick={() => setHoveredEvent(e)}
              />
            ))}
            {/* FLOATING EVENT CARD WHEN HOVER MARKER */}
            {hoveredEvent && hasValidLocation(hoveredEvent) && (
              <InfoWindow
                position={{
                  lat: hoveredEvent.location.lat,
                  lng: hoveredEvent.location.lng,
                }}
                onCloseClick={() => setHoveredEvent(null)}
              >
                <div
                  style={styles.infoWindowCard}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  {renderEventContent(hoveredEvent, true)}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}
      {/* GOOGLE MAPS POPUP */}
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
      {/* EMAIL / PHONE POPUP */}
      {selectedContact && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {selectedContact.type === "email"
                ? "Open Gmail?"
                : "Open Phone?"}
            </h2>
            <p style={styles.modalText}>
              {selectedContact.type === "email"
                ? "Do you want to redirect to Gmail for "
                : "Do you want to redirect to phone dialer for "}
              <strong>{selectedContact.value}</strong>
              {selectedContact.eventTitle && (
                <>
                  {" "}
                  from <strong>{selectedContact.eventTitle}</strong>?
                </>
              )}
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={openContactLink}
                style={styles.openMapButton}
              >
                {selectedContact.type === "email"
                  ? "Open Gmail"
                  : "Open Phone"}
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
  organizerBox: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "8px",
  },
  organizerName: {
    margin: "0 0 4px 0",
    fontWeight: "bold",
    color: "#444",
  },
  contactLine: {
    margin: "3px 0",
  },
  contactLabel: {
    fontWeight: "bold",
    color: "#555",
  },
  contactLink: {
    color: "#4facfe",
    textDecoration: "underline",
    cursor: "pointer",
    wordBreak: "break-word",
  },
  mutedText: {
    color: "#999",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.5",
  },
  date: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#888",
  },
  distanceText: {
    fontSize: "12px",
    color: "gray",
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
  infoWindowCard: {
    width: "250px",
    padding: "4px",
    fontFamily: "Segoe UI, sans-serif",
  },
  infoWindowTitle: {
    fontSize: "16px",
    margin: "0 0 8px 0",
    color: "#333",
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
