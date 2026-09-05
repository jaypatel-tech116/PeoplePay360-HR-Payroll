const express = require("express");
const {
  getPayruns,
  getPayrunById,
  createPayrun,
  computePayrun,
  validatePayrun,
  markPayrunPaid,
  sendPayslips,
  deletePayrun,
  getPayslips,
  getPayslipById,
  getPayslipPdf,
  getEmployeePayrollSummary,
} = require("../controllers/payroll.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

// Role definitions
const ALL_PAYROLL_STAFF = ["ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "HR_MANAGER"];
const PAYROLL_ADMIN_ROLES = ["ADMIN", "HR_PAYROLL_MANAGER"];

// Payrun Management
router.get("/payruns", authenticateToken, requireRole(ALL_PAYROLL_STAFF), getPayruns);
router.get("/payruns/:id", authenticateToken, requireRole(ALL_PAYROLL_STAFF), getPayrunById);
router.post("/payruns", authenticateToken, requireRole(ALL_PAYROLL_STAFF), createPayrun);
router.post("/payruns/:id/compute", authenticateToken, requireRole(ALL_PAYROLL_STAFF), computePayrun);
router.post("/payruns/:id/validate", authenticateToken, requireRole(ALL_PAYROLL_STAFF), validatePayrun);
router.post("/payruns/:id/mark-paid", authenticateToken, requireRole(ALL_PAYROLL_STAFF), markPayrunPaid);
router.post("/payruns/:id/pay", authenticateToken, requireRole(ALL_PAYROLL_STAFF), markPayrunPaid);
router.post("/payruns/:id/send-payslips", authenticateToken, requireRole(ALL_PAYROLL_STAFF), sendPayslips);
router.delete("/payruns/:id", authenticateToken, requireRole(PAYROLL_ADMIN_ROLES), deletePayrun);

// Payslip Operations
router.get("/payslips", authenticateToken, getPayslips);
router.get("/payslips/:id", authenticateToken, getPayslipById);
router.get("/payslips/:id/pdf", authenticateToken, getPayslipPdf);

// Employee Payroll Summary (Requirement 25)
router.get("/employee-summary/:employeeId", authenticateToken, getEmployeePayrollSummary);

module.exports = router;
