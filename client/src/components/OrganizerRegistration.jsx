
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
//
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      alert("Phone must be 10–12 digits.");
      return;
    }
    if (!isPasswordValid) {
      alert("Password does not meet requirements.");
      return;
    }
    try {
      await axios.post(
        "https://event-app-ed9f.onrender.com/api/organizer/register",
        formData
      );
      setMessage("Registration successful!");
      setFormData({ name: "", email: "", phone: "", password: "" });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed."
      );
    }
  };
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Organizer Registration</h1>
        {message && <p style={styles.message}>{message}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          <input
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
                ✓ 8 characters
              </p>
              <p style={passwordRules.hasUppercase ? styles.valid : styles.invalid}>
                ✓ Uppercase letter
              </p>
              <p style={passwordRules.hasNumber ? styles.valid : styles.invalid}>
                ✓ Number
              </p>
              <p style={passwordRules.hasSpecialChar ? styles.valid : styles.invalid}>
                ✓ Special character
              </p>
            </div>
          )}
          <button style={styles.button}>Register</button>
          <p style={styles.linkText}>
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} style={styles.link}>
              Login
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
    color: "green",
  },
  passwordBox: {
    fontSize: "12px",
  },
  valid: { color: "green" },
  invalid: { color: "red" },
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
export default OrganizerRegistration;
