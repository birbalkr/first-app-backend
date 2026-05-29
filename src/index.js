import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

import {connectDB} from "./lib/db.js";
import job from "./lib/cron.js";
console.log("hleeo: ", process.env.PORT);



const app = express();
const PORT = process.env.PORT || 3000;

job.start();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/book", bookRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});

