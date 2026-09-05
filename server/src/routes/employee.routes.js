const express = require("express");
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employee.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

const STAFF_READ_ROLES = ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"];

router.get("/", authenticateToken, requireRole(STAFF_READ_ROLES), getEmployees);
router.get("/:id", authenticateToken, requireRole(STAFF_READ_ROLES), getEmployeeById);
router.post("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), createEmployee);
router.put("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), updateEmployee);
router.delete("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), deleteEmployee);

module.exports = router;

