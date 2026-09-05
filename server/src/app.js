const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// Route imports
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const employeeRoutes = require("./routes/employee.routes");
const departmentRoutes = require("./routes/department.routes");
const contractRoutes = require("./routes/contract.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const leaveRoutes = require("./routes/leave.routes");
const payrollRoutes = require("./routes/payroll.routes");
const salaryRuleRoutes = require("./routes/salary-rule.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const auditRoutes = require("./routes/audit.routes");
const dbRoutes = require("./routes/db.routes");
const hrRoutes = require("./routes/hr.routes");
const employeePortalRoutes = require("./routes/employeePortal.routes");

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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
    message: "PeoplePay360 MySQL Server is healthy and running",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "MySQL 8.0 (Local)",
    },
  });
});

// 5. Mount API feature routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", userRoutes); // backwards compatibility
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/salary-rules", salaryRuleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/db", dbRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/employee/me", employeePortalRoutes);

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
