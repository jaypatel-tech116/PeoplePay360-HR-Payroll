const express = require("express");
const {
  getSalaryStructures,
  createSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure,
  getSalaryRules,
  createSalaryRule,
  updateSalaryRule,
  deleteSalaryRule,
} = require("../controllers/salary-rule.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

// Configuration Read: HR_PAYROLL_USER, HR_PAYROLL_MANAGER, HR_MANAGER, ADMIN
const READ_ROLES = ["ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "HR_MANAGER"];

// Configuration Mutate (Create, Update, Delete): ONLY HR_PAYROLL_MANAGER and ADMIN (Denied to HR_PAYROLL_USER)
const MUTATE_ROLES = ["ADMIN", "HR_PAYROLL_MANAGER"];

// Structures
router.get("/structures", authenticateToken, requireRole(READ_ROLES), getSalaryStructures);
router.post("/structures", authenticateToken, requireRole(MUTATE_ROLES), createSalaryStructure);
router.put("/structures/:id", authenticateToken, requireRole(MUTATE_ROLES), updateSalaryStructure);
router.delete("/structures/:id", authenticateToken, requireRole(MUTATE_ROLES), deleteSalaryStructure);

// Rules
router.get("/rules", authenticateToken, requireRole(READ_ROLES), getSalaryRules);
router.post("/rules", authenticateToken, requireRole(MUTATE_ROLES), createSalaryRule);
router.put("/rules/:id", authenticateToken, requireRole(MUTATE_ROLES), updateSalaryRule);
router.delete("/rules/:id", authenticateToken, requireRole(MUTATE_ROLES), deleteSalaryRule);

module.exports = router;
