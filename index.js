import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cron from "node-cron";
import dotenv from "dotenv";

import hotelRoutes from "./routes/hotelRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { autoCancelExpiredBookings } from "./jobs/autoCancel.js";

dotenv.config();

const app = express();


app.use(cors({ origin: "http://localhost:5173" })); // allow your React app
app.use(express.json());


app.get("/", (req, res) => res.send("API running"));


app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/pricing-rules", pricingRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    
    cron.schedule("* * * * *", async () => {
      await autoCancelExpiredBookings();
    });

    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error(err));