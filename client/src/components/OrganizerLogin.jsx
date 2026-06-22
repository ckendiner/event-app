import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrganizerLogin = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://event-app-ed9f.onrender.com/api/organizer/login",
        formData
      );

      setMessage(res.data.message);
      setIsLoggedIn(true);
      localStorage.setItem("organizerId", res.data.organzierId); //store organzier id after login, to use in event posting nanti (want to displayy on event card)
      navigate("/eventform"); //jap yang ni salah kot patutnya /eventform
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Organizer Login</h1>

        {message && <p style={styles.message}>{message}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
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

          <button style={styles.button}>Login</button>

          <p style={styles.linkText}>
            No account?{" "}
            <span onClick={() => navigate("/register")} style={styles.link}>
              Register
            </span>
          </p>
        </form>
      </div>
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
    maxWidth: "420px",
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

  button: {
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
    color: "red",
  },

  linkText: {
    textAlign: "center",
    fontSize: "14px",
  },

  link: {
    color: "#4facfe",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default OrganizerLogin;