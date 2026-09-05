const express = require("express");
const {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
} = require("../controllers/contract.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

const CONTRACT_READ_ROLES = ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"];
const CONTRACT_WRITE_ROLES = ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"];

router.get("/", authenticateToken, requireRole(CONTRACT_READ_ROLES), getContracts);
router.post("/", authenticateToken, requireRole(CONTRACT_WRITE_ROLES), createContract);
router.put("/:id", authenticateToken, requireRole(CONTRACT_WRITE_ROLES), updateContract);
router.delete("/:id", authenticateToken, requireRole(CONTRACT_WRITE_ROLES), deleteContract);

module.exports = router;

