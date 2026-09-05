const express = require("express");
const {
  getAttendance,
  punch,
} = require("../controllers/attendance.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getAttendance);
router.post("/punch", authenticateToken, punch);

module.exports = router;

