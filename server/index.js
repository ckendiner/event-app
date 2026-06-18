
//MERN-STACK>server>index.js
import express from "express"
import mongoose, { mongo } from "mongoose"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import cors from "cors"
//line 8 to 16 is for resolving ECONNREFUSED when connecting DBmongo
import dns from "dns"
import userRoute from './route/userRoute.js';
import eventRoute from "./route/eventRoute.js";
import organizerRoute from "./route/organizerRoute.js"
dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])
const app = express();
app.use(cors());
app.use(bodyParser.json());
//mounting middleware
app.use("/api", userRoute); 
app.use("/api", eventRoute);
app.use("/api", organizerRoute);
dotenv.config();
const PORT = process.env.PORT || 8000
const MONGOURL = process.env.MONGO_URL;
mongoose
    .connect(MONGOURL)
    .then(()=>{
        console.log("DB connected successfully.")
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port :${PORT}`)
        })
    })
    .catch((error)=>console.log(error));
