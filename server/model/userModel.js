
//MERN-STACK/server/model/userModel.js
import mongoose from "mongoose"
//define schema for database
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    address:{
        type:String,
        required: true
    },
})
export default mongoose.model("User", userSchema)
