import express from "express";
import cors from "cors";
import helmet from "helmet";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import participantRoutes from "./routes/participant.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import userRoutes from "./routes/user.routes.js";


const app = express();
app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}))

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventHub API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;