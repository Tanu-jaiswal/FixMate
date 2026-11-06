const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const providerRoutes = require("./routes/providers");
const serviceRoutes = require("./routes/services");
const bookingRoutes = require("./routes/bookings");

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    req.body = {};
  }
  next();
});

app.get("/", (req, res) => {
  res.send("FixMate backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FixMate API is working!",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "The requested resource was not found." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error.code === 11000) {
    res.status(409).json({ message: "An account with that email already exists." });
    return;
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    res.status(400).json({ message: "The submitted data is invalid." });
    return;
  }

  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    res.status(error.status).json({ message: "The request could not be processed." });
    return;
  }

  if (Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 500) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error.message === "Origin is not allowed by CORS") {
    res.status(403).json({ message: error.message });
    return;
  }

  console.error("API request failed:", error.message);
  res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : "An unexpected server error occurred.",
  });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be configured before starting FixMate.");
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected successfully.");

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`FixMate server running on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("FixMate startup failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
