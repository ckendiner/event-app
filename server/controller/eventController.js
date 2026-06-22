
//MERN-STACK/server/controller/eventController.js
import Event from "../model/eventModel.js";
export const createEvent = async (req, res) => {
    try {
        console.log("Event request body: ", req.body);
        const { title, description, date, location, categories} = req.body;
        /* */
        if(!title || !description || !date || !location || !categories) {
            return res.status(400).json({
                message: "Please fill in all event fields.",
            });
        }
    if (!location.lat || !location.lng) {
        return res.status(400).json({
            message: "Please choose location from the map.",
        });
    }
    if (!Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({
            message: "Please select at least one category.",
        });
    }
    
    const { organizerId } = req.body.organizerId;

    const newEvent = new Event({
    title,
    description,
    date,
    location,
    categories,
    organizerId,
    });

    if (!organizerId) {
        return res.status(400).json({
          message: "Organizer ID is required. please login again",
        });
      }

    const savedEvent = await newEvent.save();
    res.status(201).json({
        message: "Event created successfully.",
        event: savedEvent
    });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({
            errorMessage: error.message,
        });
    }
};
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
        .populate("organizerId", "name email phone")
        .sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({
            errorMessage: error.message,
        });
    }
};
export const getEventById = async (req, res) => {
    try {
        const id = req.params.id;
        const event = await Event.findById(id);
        if(!event) {
            return res.status(404).json({
                message: " Event not found.",
            });
        }
        res.status(200),json(events);
    } catch (error) {
        res.status(500).json({
            errorMessage: error.message,
        });
    }
};
export const deleteEvent = async (req, res) => {
    try {
        const is = req.params.id;
        const event = await Event.findById(id);
        if(!event) {
            return res.status(404).json({
                message: "Event not found.",
            });
        }
        await Event.findByIdAndDelete(id);
        res.status(200).json({
            message: "Event deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({
            errorMessage: error.message,
        });
    }
};
