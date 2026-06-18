
// MERN-STACK/client/src/components/OrganizerLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const OrganizerLogin = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8000/api/organizer/login",
        formData
      );
      setMessage(res.data.message);
      setIsLoggedIn(true);         // mark as logged in
      navigate("/eventform");      // redirect to EventForm
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed.");
    }
  };
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Organizer Login</h2>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
};
const styles = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Arial" },
  card: { width: "300px", padding: "25px", borderRadius: "12px", textAlign: "center", backgroundColor: "#ffc4d6" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid black" },
  button: { padding: "12px", borderRadius: "8px", backgroundColor: "#57c46b", color: "#fff", cursor: "pointer" }
};
export default OrganizerLogin;
