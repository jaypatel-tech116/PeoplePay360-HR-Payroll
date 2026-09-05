const { body } = require("express-validator");

/**
 * Validation rules for user registration (Email and Password only)
 */
const registerValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

/**
 * Validation rules for user login (Email and Password only)
 */
const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/**
 * Validation rules for profile updates
 */
const updateProfileValidator = [
  body("name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
};
