import express from "express";

import {
  createEvent,
  getAllEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controller/eventController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const eventRoute = express.Router();

eventRoute.get("/events", getAllEvents);
eventRoute.get("/my-events", verifyToken, getMyEvents);
eventRoute.get("/event/:id", getEventById);

eventRoute.post("/event", verifyToken, createEvent);
eventRoute.put("/update/event/:id", verifyToken, updateEvent);
eventRoute.delete("/delete/event/:id", verifyToken, deleteEvent);

export default eventRoute;