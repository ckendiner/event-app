import Event from "../model/eventModel.js";

const isValidEventData = ({ title, description, date, location, categories }) => {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  return (
    typeof title === "string" &&
    title.trim().length > 0 &&
    typeof description === "string" &&
    description.trim().length > 0 &&
    date &&
    !Number.isNaN(new Date(date).getTime()) &&
    location &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Array.isArray(categories) &&
    categories.length > 0
  );
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, categories } = req.body;

    if (!isValidEventData({ title, description, date, location, categories })) {
      return res.status(400).json({
        message: "Please fill in all event fields properly.",
      });
    }

    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      date,
      location: {
        lat: Number(location.lat),
        lng: Number(location.lng),
        address: location.address || "",
      },
      categories,
      organizerId: req.user.id,
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

export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user.id })
      .populate("organizerId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching my events:", error);

    res.status(500).json({
      errorMessage: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const id = req.params.id;

    const event = await Event.findById(id).populate(
      "organizerId",
      "name email phone"
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({
      errorMessage: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, date, location, categories } = req.body;

    if (!isValidEventData({ title, description, date, location, categories })) {
      return res.status(400).json({
        message: "Please fill in all event fields properly.",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to edit this event.",
      });
    }

    event.title = title.trim();
    event.description = description.trim();
    event.date = date;
    event.location = {
      lat: Number(location.lat),
      lng: Number(location.lng),
      address: location.address || event.location.address || "",
    };
    event.categories = categories;

    const updatedEvent = await event.save();

    res.status(200).json({
      message: "Event updated successfully.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);

    res.status(500).json({
      errorMessage: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this event.",
      });
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting event:", error);

    res.status(500).json({
      errorMessage: error.message,
    });
  }
};