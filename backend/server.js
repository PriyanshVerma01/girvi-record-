import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import girviRoutes from "./routes/girviRoutes.js";

const app = express();

app.disable("x-powered-by");

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Body parser limits
app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(cookieParser());

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

// Strict login rate limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Apply general rate limit to API routes
app.use("/api", generalLimiter);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Girvi Record API is running",
  });
});

// Authentication routes
app.use(
  "/api/auth/login",
  loginLimiter
);

app.use("/api/auth", authRoutes);

// Girvi record routes
app.use("/api/girvi", girviRoutes);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  const statusCode =
    error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : error.message || "Server error.",
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server failed to start:",
      error.message
    );

    process.exit(1);
  }
};

startServer();