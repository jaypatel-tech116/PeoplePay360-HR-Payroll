const express = require("express");
const {
  getSalaryStructures,
  createSalaryStructure,
  getSalaryRules,
  createSalaryRule,
} = require("../controllers/salary-rule.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

const SALARY_ROLES = ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "PAYROLL_MANAGER"];

router.get("/structures", authenticateToken, requireRole(SALARY_ROLES), getSalaryStructures);
router.post("/structures", authenticateToken, requireRole(SALARY_ROLES), createSalaryStructure);

router.get("/rules", authenticateToken, requireRole(SALARY_ROLES), getSalaryRules);
router.post("/rules", authenticateToken, requireRole(SALARY_ROLES), createSalaryRule);

module.exports = router;

