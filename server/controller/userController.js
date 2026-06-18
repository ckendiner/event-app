
//MERN-STACK/server/controller/userController.js
import User from "../model/userModel.js"
export const create = async(req, res)=>{
    console.log("Request body:", req.body);//debug
    try{
        const newUser = new User(req.body);
        console.log("New user created: ", newUser);
        const {email} = newUser;
        const userExist = await User.findOne({email})
        if(userExist){
            return res.status(400).json({message: "There are an account existing using this email."});
        }
        const savedData = await newUser.save();
        res.status(200).json(savedData);
    }
    catch(error){
        console.error("Error in creating new user:", error);
        res.status(500).json({errorMessage: error.message});
    }
}
export const getAllUsers = async(req, res)=>{
    try{
        const userData = await User.find();
        if(!userData || userData.length === 0 ){
            return res.status(404).json({message:"User data not found"});
        }
        res.status(200).json(userData);
    }
    catch(error){
        res.status(500).json({ errorMessage: error.message});
    }
}
export const getUserById = async(req, res)=>{
    try{
        const id = req.params.id;
        const userExist = await User.findById(id);
        if(!userExist){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(userExist);
    }
    catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}
export const update = async (req, res)=>{
    try{
        const id = req.params.id;
        const userExist = await User.findById(id);
        if(!userExist){
            return res.status(404).json({message: "No user with that id"});
        }
        const updatedData = await User.findByIdAndUpdate(id, req.body, {
            new:true
        })
        res.status(200).json(updatedData);
    }
    catch(error){
        res.status(500).json({errorMessage: error.message});
    }
}
export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const userExist = await User.findById(id);
        if(!userExist){
            return res.status(404).json({messsage: "User not exist.."});
        }
        await User.findByIdAndDelete(id);
        res.status(200).json({message: "Delete User Success."});
    } catch (error) {
        res.status(500).json({ErrorMessage: error.message});
        
    }
}
