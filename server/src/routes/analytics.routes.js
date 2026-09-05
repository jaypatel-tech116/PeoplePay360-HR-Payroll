const express = require("express");
const {
  getPayrollDashboard,
  getPayrollReports,
  getAdminAnalytics,
  getHrAnalytics,
  getPayrollAnalytics,
} = require("../controllers/analytics.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/dashboard", authenticateToken, getPayrollDashboard);
router.get("/reports", authenticateToken, getPayrollReports);

// Backward-compatible routes
router.get("/admin", authenticateToken, getAdminAnalytics);
router.get("/hr", authenticateToken, getHrAnalytics);
router.get("/payroll", authenticateToken, getPayrollAnalytics);

module.exports = router;
