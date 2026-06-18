
//MERN-STACK/server/route/eventRoute.js
import express from "express"
import { 
    createEvent,
    getAllEvents,
    getEventById,
    deleteEvent
 } from "../controller/eventController.js";
const eventRoute = express.Router();
eventRoute.post("/event", createEvent);
eventRoute.get("/events", getAllEvents);
eventRoute.get("/event/:id", getEventById);
eventRoute.delete("/delete/event/:id", deleteEvent);
export default eventRoute;
