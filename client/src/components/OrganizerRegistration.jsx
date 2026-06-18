
// MERN-STACK/client/src/components/OrganizerRegistration.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const OrganizerRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*]/.test(formData.password),
    hasUppercase: /[A-Z]/.test(formData.password),
  };
  const isPasswordValid =
    passwordRules.minLength &&
    passwordRules.hasNumber &&
    passwordRules.hasSpecialChar &&
    passwordRules.hasUppercase;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const validatePhone = (phone) => {
    return /^[0-9]{10,12}$/.test(phone);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password } = formData;
    if (!name || !email || !phone || !password) {
      alert("Please fill in all fields.");
      return;
    }
    if (!validatePhone(phone)) {
      alert("Phone number must contain 10 to 12 digits only.");
      return;
    }
    if (!isPasswordValid) {
      alert("Please make sure your password follows all the rules.");
      return;
    }
    try {
      const response = await axios.post(
        "https://event-app-ed9f.onrender.com/api/organizer/register", formData);
      console.log("Organizer registered:", response.data);
      setMessage("Organizer registered successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(
        error.response?.data?.message ||
          error.response?.data?.errorMessage ||
          "Failed to register organizer."
      );
    }
  };
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Organizer Registration Form</h2>
        {message && <p style={styles.message}>{message}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
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
          {formData.password && (
            <div style={styles.passwordBox}>
              <p style={passwordRules.minLength ? styles.valid : styles.invalid}>
                {passwordRules.minLength ? "✓" : "✗"} At least 8 characters
              </p>
              <p style={passwordRules.hasUppercase ? styles.valid : styles.invalid}>
                {passwordRules.hasUppercase ? "✓" : "✗"} At least 1 uppercase letter
              </p>
              <p style={passwordRules.hasNumber ? styles.valid : styles.invalid}>
                {passwordRules.hasNumber ? "✓" : "✗"} At least 1 number
              </p>
              <p style={passwordRules.hasSpecialChar ? styles.valid : styles.invalid}>
                {passwordRules.hasSpecialChar ? "✓" : "✗"} At least 1 special character
              </p>
            </div>
          )}
          <button type="submit" style={styles.registerButton}>
            Register
          </button>
          <p style={{ marginTop: "10px" }}>
            have an account?{" "}
            <span 
              style={{ color: "blue", cursor: "pointer" }} 
              onClick={() => navigate("/login")}
            >
              login
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
    background: "#ffc4d6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "300px",
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
  },
  title: {
    color: "black",
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
  },
  input: {
    width: "230px",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid black",
    background: "linear-gradient(90deg, #8e5cf7, #ff914d)",
    color: "black",
    textAlign: "center",
    fontSize: "14px",
    outline: "none",
  },
  passwordBox: {
    width: "240px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "10px",
    textAlign: "left",
    fontSize: "12px",
  },
  valid: {
    color: "green",
    margin: "4px 0",
    fontWeight: "bold",
  },
  invalid: {
    color: "red",
    margin: "4px 0",
    fontWeight: "bold",
  },
  registerButton: {
    width: "170px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid black",
    backgroundColor: "#d8ffd8",
    fontSize: "14px",
    cursor: "pointer",
  },
  message: {
    backgroundColor: "#fff",
    padding: "8px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
  },
};
export default OrganizerRegistration;
