
// MERN-STACK/client/src/App.js
import React, {useState, useEffect} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EventForm from "./components/EventForm.jsx";
import User from "./getUser/User.jsx";
import OrganizerRegistration from "./components/OrganizerRegistration.jsx";
import OrganizerLogin from "./components/OrganizerLogin.jsx";
import HomePage from "./components/HomePage.jsx";
import "./App.css";
function App() {
  
  //persist login in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  // Update localStorage whenever login state changes
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/users" element={<User />} />
        <Route path="/register" element={<OrganizerRegistration />} />
        <Route
          path="/login"
          element={<OrganizerLogin setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/eventform"
          element={
            isLoggedIn ? <EventForm /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
