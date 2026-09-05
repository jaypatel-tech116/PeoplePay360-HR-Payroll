const express = require("express");
const {
  getPayruns,
  getPayrunById,
  createPayrun,
  computePayrun,
  validatePayrun,
  getPayslips,
  getPayslipById,
} = require("../controllers/payroll.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

const PAYROLL_ROLES = ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "PAYROLL_MANAGER"];
const ALL_PAYROLL_STAFF = [...PAYROLL_ROLES, "HR_PAYROLL_USER", "PAYROLL_USER"];

router.get("/payruns", authenticateToken, requireRole(ALL_PAYROLL_STAFF), getPayruns);
router.get("/payruns/:id", authenticateToken, requireRole(ALL_PAYROLL_STAFF), getPayrunById);
router.post("/payruns", authenticateToken, requireRole(PAYROLL_ROLES), createPayrun);
router.post("/payruns/:id/compute", authenticateToken, requireRole(PAYROLL_ROLES), computePayrun);
router.post("/payruns/:id/validate", authenticateToken, requireRole(PAYROLL_ROLES), validatePayrun);

router.get("/payslips", authenticateToken, requireRole(ALL_PAYROLL_STAFF), getPayslips);
router.get("/payslips/:id", authenticateToken, getPayslipById);

module.exports = router;

