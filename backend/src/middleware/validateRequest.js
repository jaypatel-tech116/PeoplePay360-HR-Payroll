/**
 * Input Validation Middleware
 * Validates and sanitizes request parameters to prevent injection and invalid data.
 */

/**
 * Validates that a route parameter is a positive integer.
 * Prevents SQL injection via route params and catches NaN early.
 */
const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = parseInt(req.params[paramName], 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        error: `Invalid ${paramName}: must be a positive integer.`
      });
    }
    // Replace the string param with the parsed integer
    req.params[paramName] = id;
    next();
  };
};

/**
 * Validates required body fields exist and are non-empty.
 * @param {string[]} fields - Array of required field names
 */
const validateRequiredFields = (...fields) => {
  return (req, res, next) => {
    const missing = fields.filter(f => {
      const val = req.body[f];
      return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
    });

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
};

/**
 * Validates email format.
 */
const validateEmail = (fieldName = 'email') => {
  return (req, res, next) => {
    const email = req.body[fieldName];
    if (!email) return next(); // Let required field validator handle absence

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: `Invalid email format for field: ${fieldName}`
      });
    }
    // Normalize email
    req.body[fieldName] = email.toLowerCase().trim();
    next();
  };
};

module.exports = {
  validateIdParam,
  validatePositiveIntParam: validateIdParam,
  validateRequiredFields,
  validateEmail
};
