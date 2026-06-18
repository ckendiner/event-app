
//MERN-STACK/server/route/organizerRoute.js
import express from "express"
import {
    registerOrganizer,
    getAllOrganizers,
    loginOrganizer
} from "../controller/organizerController.js"
const organizerRoute = express.Router();
organizerRoute.post("/organizer/register", registerOrganizer);
organizerRoute.post("/organizer/login", loginOrganizer); //login route
organizerRoute.get("/organizers", getAllOrganizers);
export default organizerRoute;
