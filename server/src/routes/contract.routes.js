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

router.get("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getContracts);
router.post("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), createContract);
router.put("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), updateContract);
router.delete("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), deleteContract);

module.exports = router;

