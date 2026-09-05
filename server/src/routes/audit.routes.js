const express = require("express");
const { getAuditLogs } = require("../controllers/audit.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getAuditLogs);

module.exports = router;

