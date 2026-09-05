const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");
const { registerValidator, loginValidator } = require("../validators/auth.validator");
const { validate } = require("../middleware/validation.middleware");
const { uploadAvatar } = require("../middleware/upload.middleware");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Rate limiter to protect authentication endpoints against brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 attempts per IP per 15-minute window
  message: {
    success: false,
    message: "Too many authentication requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register - Register with email and password
router.post(
  "/register",
  authLimiter,
  registerValidator,
  validate,
  authController.register
);

// POST /api/auth/login - User login with credentials
router.post(
  "/login",
  authLimiter,
  loginValidator,
  validate,
  authController.login
);

// POST /api/auth/logout - Invalidate session cookie
router.post("/logout", authController.logout);

// GET /api/auth/me - Verify session cookie and return current user
router.get("/me", requireAuth, authController.getCurrentUser);

module.exports = router;
