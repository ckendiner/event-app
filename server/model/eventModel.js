
//MERN-STACK/server/model/eventModel.js
import mongoose from "mongoose";
const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        location: {
            lat: {
                type: Number,
                required: true,
            },
            lng: {
                type: Number,
                required: true,
            },
            address: {
                type: String,
                default: "",
            },
        },
        categories: {
            type: [String],
            required: true,
            validate: {
                validator: function (value) {
                    return value.length > 0;
                },
                message: "Please select at least one category.",
            },
        },
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organizer",
            required: true,
        },
    },
    { timestamps: true}
);
export default mongoose.model("Event", eventSchema);
