import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'
import { corsOptions } from "./config/corsOptions.js";
import { connectDB } from "./db/dbConn.js";
import job from "./lib/cron.js";

dotenv.config();

const app = express();
const port = 3500;

job.start();
app.use(cors(corsOptions));
app.use(express.json());

app.use('/auth', authRoutes)
app.use('/post', postRoutes)

app.listen(port, () => {
  connectDB();
  console.log(`Server is listening on port ${port}`);
});
