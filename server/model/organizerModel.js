
//MERN-STACK/server/model/organizerModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const organizerSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: true,
        trim: true,
        },
        email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        },
        phone: {
        type: String,
        required: true,
        trim: true,
        },
        password: {
        type: String,
        required: true,
        trim: true,
        },
    },
    {timestamps: true}
);
// Hash password before saving
organizerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// Method to compare password during login (optional for future)
organizerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
export default mongoose.model("Organizer", organizerSchema);
