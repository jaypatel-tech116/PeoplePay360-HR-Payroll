const express = require("express");
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/department.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticateToken, getDepartments);
router.post("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), createDepartment);
router.put("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), updateDepartment);
router.delete("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), deleteDepartment);

module.exports = router;

