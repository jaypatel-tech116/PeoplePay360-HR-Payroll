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

router.get("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getEmployees);
router.get("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getEmployeeById);
router.post("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), createEmployee);
router.put("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), updateEmployee);
router.delete("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), deleteEmployee);

module.exports = router;

