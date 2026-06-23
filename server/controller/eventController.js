
//MERN-STACK/server/controller/eventController.js
import Event from "../model/eventModel.js";
export const createEvent = async (req, res) => {
    try {
      console.log("Event request body:", req.body);
  
      const {
        title,
        description,
        date,
        location,
        categories,
      } = req.body;
  
      // FIXED VALIDATION
      if (
        !title ||
        !description ||
        !date ||
        !location?.lat ||
        !location?.lng ||
        !categories ||
        categories.length === 0
      ) {
        return res.status(400).json({
          message: "Missing fields detected",
          debug: {
            title,
            description,
            date,
            location,
            categories
          }
        });
      }
  
      const newEvent = new Event({
        title,
        description,
        date,
        location,
        categories,
        organizerId: req.user.id, // Use the authenticated user's ID
      });
  
      const savedEvent = await newEvent.save();
  
      res.status(201).json({
        message: "Event created successfully.",
        event: savedEvent,
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
        res.status(200).json(event);//changed , to .
    } catch (error) {
        res.status(500).json({
            errorMessage: error.message,
        });
    }
};
export const deleteEvent = async (req, res) => {
    try {
        const id = req.params.id; //changed is to id
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
