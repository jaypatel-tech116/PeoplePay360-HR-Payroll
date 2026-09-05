const express = require("express");
const {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  getAllRoles,
  createUser,
  updateUserById,
  deactivateUser,
  activateUser,
  getStakeholderStats,
} = require("../controllers/user.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

// 1. Profile endpoints (Self)
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

// 2. Stakeholder Stats (Admin & HR)
router.get("/stats", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getStakeholderStats);

// 3. System Roles (Admin & HR)
router.get("/roles", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getAllRoles);

// 4. Stakeholder CRUD
router.get("/", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getAllUsers);
router.get("/:id", authenticateToken, requireRole(["ADMIN", "HR_MANAGER"]), getUserById);
router.post("/", authenticateToken, requireRole(["ADMIN"]), createUser);
router.put("/:id", authenticateToken, requireRole(["ADMIN"]), updateUserById);

// 5. Soft Delete / Deactivate & Reactivate (Admin only)
router.delete("/:id", authenticateToken, requireRole(["ADMIN"]), deactivateUser);
router.patch("/:id/deactivate", authenticateToken, requireRole(["ADMIN"]), deactivateUser);
router.patch("/:id/activate", authenticateToken, requireRole(["ADMIN"]), activateUser);

module.exports = router;
