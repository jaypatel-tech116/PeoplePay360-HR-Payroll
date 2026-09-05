const express = require("express");
const {
  getProfile,
  updateProfile,
  getAllUsers,
  getAllRoles,
  updateUserById,
  createUser,
} = require("../controllers/user.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

// Profile endpoints
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

// Management endpoints (Protected)
router.get("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getAllUsers);
router.get("/roles", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getAllRoles);
router.post("/", authenticateToken, requireRole(["ADMIN"]), createUser);
router.put("/:id", authenticateToken, requireRole(["ADMIN"]), updateUserById);

module.exports = router;

