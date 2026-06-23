
//MERN-STACK/server/controller/organizerController.js
import Organizer from "../model/organizerModel.js"

import jwt from "jsonwebtoken";

export const registerOrganizer = async (req, res) =>{
    try {
        const { name, email, phone, password } = req.body;
        //check all field
        if(!name || !email || !phone || !password){
            return res.status(400).json({
                message: "All foleds are required."
            });
        }
        
        //check if email has been used
        const exist = await Organizer.findOne({ email });
        if(exist){
            return res.status(400).json({
                message: "Email has been used before."
            });
        }
        const newOrganizer = new Organizer({ 
            name,
            email, 
            phone, 
            password
        });
        await newOrganizer.save();
        res.status(201).json({
            message: "Organizer registererd successfully."
        });
    } catch (error) {
        console.error("Organizier registration error: ", error);
        res.status(500).json({
            errorMessage: error.message
        });
    }
};
export const getAllOrganizers = async (req, res) => {
    try {
        const organizers = await Organizer.find().sort({ createdAt: -1});
        res.status(200).json(organizers);
    } catch (error) {
        res.status(500).json({
            errorMessage: error.message
        });
    }
};
//organizer login controller
export const loginOrganizer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "email and password are both required."
            });
        }

        const organizer = await Organizer.findOne({ email });

        if (!organizer) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await organizer.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 🔥 CREATE JWT TOKEN (IMPORTANT FIX)
        const token = jwt.sign(
            {
                id: organizer._id,
                email: organizer.email,
                name: organizer.name
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful!",
            token,                 // ✅ ADD THIS
            organizerId: organizer._id
        });

    } catch (error) {
        console.error("Organizer login error:", error);
        res.status(500).json({ errorMessage: error.message });
    }
};
