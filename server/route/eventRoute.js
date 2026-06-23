import express from "express";
import {
    createEvent,
    getAllEvents,
    getEventById,
    deleteEvent
} from "../controller/eventController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const eventRoute = express.Router();

// 🔐 PROTECT ALL EVENT ROUTES


eventRoute.post("/event", verifyToken, createEvent);
eventRoute.get("/events", verifyToken, getAllEvents);
eventRoute.get("/event/:id", verifyToken, getEventById);
eventRoute.delete("/delete/event/:id", verifyToken, deleteEvent);

export default eventRoute;