const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const dbRoutes = require("./routes/db.routes");
const { errorHandler } = require("./middleware/errorHandler.middleware");
const { errorResponse, successResponse } = require("./utils/apiResponse");

dotenv.config();

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS setup - supports localhost:5173, 5174, etc. with credentials
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, Postman) or matching local dev ports
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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
app.use("/api/db", dbRoutes);

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
