const express = require("express");
const {
  getAdminAnalytics,
  getHrAnalytics,
  getPayrollAnalytics,
} = require("../controllers/analytics.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/admin", authenticateToken, getAdminAnalytics);
router.get("/hr", authenticateToken, getHrAnalytics);
router.get("/payroll", authenticateToken, getPayrollAnalytics);

module.exports = router;
