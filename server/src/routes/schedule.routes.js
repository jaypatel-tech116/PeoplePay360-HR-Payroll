const express = require("express");
const {
  getSchedules,
  createSchedule,
} = require("../controllers/schedule.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticateToken, getSchedules);
router.post("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), createSchedule);

module.exports = router;

