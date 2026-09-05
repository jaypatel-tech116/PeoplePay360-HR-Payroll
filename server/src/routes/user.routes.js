const express = require("express");
const userController = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { uploadAvatar } = require("../middleware/upload.middleware");
const { updateProfileValidator } = require("../validators/auth.validator");
const { validate } = require("../middleware/validation.middleware");

const router = express.Router();

// Protect all user profile routes with authentication middleware
router.use(requireAuth);

// GET /api/user/profile - Fetch authenticated user details
router.get("/profile", userController.getProfile);

// PUT /api/user/profile - Update name, email, and/or upload & replace avatar
router.put(
  "/profile",
  uploadAvatar,
  updateProfileValidator,
  validate,
  userController.updateProfile
);

module.exports = router;
