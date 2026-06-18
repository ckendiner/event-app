
//MERN-STACK/server/route/userRoute.js
import express from "express"
import { 
    create,
    deleteUser,
    getAllUsers,
    getUserById,
    update } from "../controller/userController.js"
const userRoute = express.Router();
userRoute.post("/user", create)
userRoute.get("/user", getAllUsers)
userRoute.get("/users", getAllUsers)
userRoute.get("/user/:id", getUserById)
userRoute.put("/update/user/:id", update)
userRoute.delete("/delete/user/:id", deleteUser)
//here    2.  ^  /api will be used in link when testing on POSTMAN
export default userRoute;
