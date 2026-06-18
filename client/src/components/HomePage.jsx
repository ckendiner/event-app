
// client/src/components/HomePage.jsx
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
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setUserLocation({ lat: 3.139, lng: 101.6869 }); // default fallback
      }
    );
  }, []);
  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/events");
        setEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  // Filter events within 15km radius
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // km
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
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>Welcome to Event Management</h1>
      <button
        style={{
          padding: "12px 20px",
          backgroundColor: "#57c46b",
          color: "#fff",
          borderRadius: "8px",
          cursor: "pointer",
          display: "block",
          margin: "20px auto",
        }}
        onClick={() => navigate("/register")}
      >
        Register as Organizer
      </button>
      <h2>Events Near You (within 15 km)</h2>
      {loading ? (
        <p>Loading events...</p>
      ) : nearbyEvents.length === 0 ? (
        <p>No nearby events found.</p>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Categories</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {nearbyEvents.map((e) => (
                <tr key={e._id}>
                  <td>{e.title}</td>
                  <td>{e.description}</td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.categories.join(", ")}</td>
                  <td>
                    Lat: {e.location.lat}, Lng: {e.location.lng}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoaded && userLocation && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={userLocation}
              zoom={12}
            >
              {nearbyEvents.map((e) => (
                <Marker
                  key={e._id}
                  position={{ lat: e.location.lat, lng: e.location.lng }}
                  title={e.title}
                />
              ))}
            </GoogleMap>
          )}
        </>
      )}
    </div>
  );
};
export default HomePage;
