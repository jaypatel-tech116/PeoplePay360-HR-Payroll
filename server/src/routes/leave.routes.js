const express = require("express");
const {
  getLeaveTypes,
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus,
  getLeaveBalance,
} = require("../controllers/leave.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/types", authenticateToken, getLeaveTypes);
router.get("/requests", authenticateToken, getLeaveRequests);
router.post("/requests", authenticateToken, createLeaveRequest);
router.patch("/requests/:id/status", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), updateLeaveStatus);
router.patch("/requests/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), updateLeaveStatus);
router.get("/balance/:employeeId", authenticateToken, getLeaveBalance);

module.exports = router;

