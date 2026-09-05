const express = require("express");
const {
  getAttendance,
  punch,
} = require("../controllers/attendance.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

const ATTENDANCE_READ_ROLES = ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"];

router.get("/", authenticateToken, requireRole(ATTENDANCE_READ_ROLES), getAttendance);
router.post("/punch", authenticateToken, punch);

module.exports = router;

