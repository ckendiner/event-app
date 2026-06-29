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

  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");

  // ✅ NEW: hovered event for map popup
  const [hoveredEvent, setHoveredEvent] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const userIcon = {
    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  };

  const addDistance = (list) => {
    if (!userLocation) return list;
  
    return list.map((e) => ({
      ...e,
      distance: getDistance(
        userLocation.lat,
        userLocation.lng,
        e.location.lat,
        e.location.lng
      ),
    }));
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const hasValidLocation = (e) =>
    e?.location?.lat != null && e?.location?.lng != null;

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const filterByTime = (list) => {
    if (timeFilter === "all") return list;

    return list.filter((e) => {
      const date = new Date(e.date);

      if (timeFilter === "today") {
        const end = new Date(todayStart);
        end.setDate(end.getDate() + 1);
        return date >= todayStart && date < end;
      }

      if (timeFilter === "week") {
        const end = new Date(todayStart);
        end.setDate(end.getDate() + 7);
        return date >= todayStart && date < end;
      }

      if (timeFilter === "month") {
        const end = new Date(todayStart);
        end.setDate(end.getDate() + 30);
        return date >= todayStart && date < end;
      }

      return true;
    });
  };

  const filteredEvents = filterByTime(events.filter(hasValidLocation));

  const upcomingEvents = filteredEvents.filter(
    (e) => new Date(e.date) >= todayStart
  );

  const pastEvents = filteredEvents.filter(
    (e) => new Date(e.date) < todayStart
  );

  const filterNearby = (list) =>
    userLocation
      ? list.filter(
          (e) =>
            getDistance(
              userLocation.lat,
              userLocation.lng,
              e.location.lat,
              e.location.lng
            ) <= 10
        )
      : list;

      const nearbyUpcoming = addDistance(filterNearby(upcomingEvents))
      .sort((a, b) => a.distance - b.distance);
    
    const nearbyPast = addDistance(filterNearby(pastEvents))
      .sort((a, b) => a.distance - b.distance);

  const getGoogleMapsUrl = (e) =>
    `https://www.google.com/maps/dir/?api=1&destination=${e.location.lat},${e.location.lng}`;

  const renderEventContent = (eventData) => {
    const organizer = eventData.organizerId || {};

    return (
      <>
        <h3 style={styles.title}>{eventData.title}</h3>
        <p style={styles.desc}>{eventData.description}</p>

        <p>
          <b>Organizer:</b> {organizer.name || "N/A"}
        </p>

        {/* EMAIL - opens email client */}
        <p>
        Email:{" "}
        {organizer.email ? (
          <a
            href={`mailto:${organizer.email}?subject=Inquiry about ${eventData.title}`}
            style={styles.linkBtn}
          >
            {organizer.email}
          </a>
        ) : (
          "N/A"
        )}
        </p>

        {/* PHONE - call + WhatsApp options */}
        <p>
        Phone:{" "}
        {organizer.phone ? (
          <>
            <a
              href={`tel:${organizer.phone}`}
              style={styles.linkBtn}
            >
              Call
            </a>

            {" | "}

            <a
              href={`https://wa.me/${organizer.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              style={styles.linkBtn}
            >
              WhatsApp
            </a>
          </>
        ) : (
          "N/A"
        )}
        </p>

        <p>
          <b>Date:</b> {new Date(eventData.date).toLocaleDateString()}
        </p>

        <p>
          Distance:{" "}
          {userLocation
            ? getDistance(
                userLocation.lat,
                userLocation.lng,
                eventData.location.lat,
                eventData.location.lng
              ).toFixed(2)
            : "-"}{" "}
          km
        </p>

        <div style={{ marginTop: "5px" }}>
          {eventData.categories?.map((c, i) => (
            <span key={i} style={styles.badge}>
              {c}
            </span>
          ))}
        </div>

        <button
          onClick={() => window.open(getGoogleMapsUrl(eventData), "_blank")}
          style={styles.linkBtn}
        >
          Event Venue
        </button>
      </>
    );
  };

  const renderCard = (e) => (
    <div key={e._id} style={styles.card}>
      {renderEventContent(e)}
    </div>
  );

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div style={styles.page}>
      {/* HERO */}
      <div style={styles.hero}>
        <h1>Discover Events Near You</h1>
        <button onClick={() => navigate("/register")} style={styles.heroBtn}>
          Post Your Event
        </button>
      </div>

      {/* FILTER */}
      <div style={styles.filterBar}>
        {["all", "today", "week", "month"].map((f) => (
          <button
            key={f}
            onClick={() => setTimeFilter(f)}
            style={{
              ...styles.filterBtn,
              background: timeFilter === f ? "#4facfe" : "#fff",
              color: timeFilter === f ? "#fff" : "#333",
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* UPCOMING */}
      <div style={styles.sectionContainer}>
        <button
          onClick={() => setShowUpcoming(!showUpcoming)}
          style={styles.sectionHeader}
        >
          <span>🟢 Incoming Events ({nearbyUpcoming.length})</span>
          <span>{showUpcoming ? "▲" : "▼"}</span>
        </button>

        {showUpcoming && (
          <div style={styles.sectionContent}>
            <div style={styles.grid}>
              {nearbyUpcoming.map(renderCard)}
            </div>
          </div>
        )}
      </div>

      {/* PAST */}
      <div style={styles.sectionContainer}>
        <button
          onClick={() => setShowPast(!showPast)}
          style={styles.sectionHeader}
        >
          <span>🔴 Past Events ({nearbyPast.length})</span>
          <span>{showPast ? "▲" : "▼"}</span>
        </button>

        {showPast && (
          <div style={styles.sectionContent}>
            <div style={styles.grid}>
              {nearbyPast.map(renderCard)}
            </div>
          </div>
        )}
      </div>

      {/* MAP */}
      {isLoaded && userLocation && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation}
          zoom={12}
        >
          <Marker position={userLocation} icon={userIcon} />

          <Circle
            center={userLocation}
            radius={10000}
            options={{
              strokeColor: "#4facfe",
              fillOpacity: 0.05,
            }}
          />

          {[...nearbyUpcoming, ...nearbyPast].map((e) => (
            <Marker
              key={e._id}
              position={e.location}
              onClick={() => setHoveredEvent(e)}
            />
          ))}

          {/* INFO WINDOW POPUP */}
          {hoveredEvent && (
            <InfoWindow
              position={hoveredEvent.location}
              onCloseClick={() => setHoveredEvent(null)}
            >
              <div style={{ maxWidth: "250px" }}>
                {renderEventContent(hoveredEvent)}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: "20px",
    fontFamily: "Segoe UI",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  hero: {
    textAlign: "center",
    padding: "40px",
    background: "linear-gradient(135deg,#4facfe,#00f2fe)",
    color: "white",
    borderRadius: "12px",
  },
  heroBtn: {
    marginTop: "10px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  filterBar: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    margin: "20px 0",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    cursor: "pointer",
  },
  sectionContainer: {
    width: "100%",
    maxWidth: "1000px",
    margin: "20px auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  sectionHeader: {
    width: "100%",
    padding: "18px 22px",
    background: "#fff",
    border: "none",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "18px",
  },
  sectionContent: { padding: "20px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "12px",
  },
  card: {
    border: "1px solid #ddd",
    padding: "12px",
    borderRadius: "10px",
    background: "#fff",
  },
  title: { marginBottom: "5px" },
  desc: { fontSize: "14px", marginBottom: "8px" },
  badge: {
    background: "#e0f7fa",
    padding: "4px 8px",
    marginRight: "5px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  linkBtn: {
    marginTop: "10px",
    background: "none",
    border: "none",
    color: "#4facfe",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default HomePage;