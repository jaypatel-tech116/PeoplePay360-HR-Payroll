const express = require("express");
const { requireEmployee } = require("../middleware/employeeAuth.middleware");
const {
  getDashboard,
  getProfile,
  updateProfile,
  getContract,
  getSchedule,
  getAttendance,
  punchAttendance,
  getLeaves,
  createLeaveRequest,
  getPayslips,
  getPayslipDetails,
} = require("../controllers/employeePortal.controller");

const router = express.Router();

// Apply employee authorization middleware to all self-service endpoints
router.use(requireEmployee);

// 1. Dashboard
router.get("/dashboard", getDashboard);

// 2. Profile
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

// 3. Contract
router.get("/contract", getContract);

// 4. Schedule
router.get("/schedule", getSchedule);

// 5. Attendance
router.get("/attendance", getAttendance);
router.post("/attendance/punch", punchAttendance);

// 6. Leaves
router.get("/leaves", getLeaves);
router.post("/leaves", createLeaveRequest);

// 7. Payslips
router.get("/payslips", getPayslips);
router.get("/payslips/:id", getPayslipDetails);

module.exports = router;
