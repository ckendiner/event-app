
//MERN-STACK/server/route/eventRoute.js
import express from "express"
import { 
    createEvent,
    getAllEvents,
    getEventById,
    deleteEvent
 } from "../controller/eventController.js";
const eventRoute = express.Router();

import { verifyToken } from "../middleware/authMiddleware.js";

eventRoute.use(verifyToken); // Apply the verifyToken middleware to all routes

eventRoute.post("/event", verifyToken,  createEvent);
eventRoute.get("/events", verifyToken, getAllEvents);
eventRoute.get("/event/:id", verifyToken, getEventById);
eventRoute.delete("/delete/event/:id", verifyToken, deleteEvent);
export default eventRoute;
