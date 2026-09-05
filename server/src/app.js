const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const { errorHandler } = require("./middleware/errorHandler.middleware");
const { errorResponse, successResponse } = require("./utils/apiResponse");

dotenv.config();

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS setup - locked to client URL with credentials support for cookies
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Body parsers and cookie parser
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// 4. Base Health check
app.get("/api/health", (req, res) => {
  return successResponse(res, {
    statusCode: 200,
    message: "Server is healthy and running",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// 5. Mount API feature routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// 6. Handle unmatched routes (404)
app.use((req, res) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 7. Centralized Error Handler (must be after all routes)
app.use(errorHandler);

module.exports = app;
