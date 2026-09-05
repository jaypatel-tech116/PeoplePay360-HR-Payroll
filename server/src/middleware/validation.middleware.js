const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Middleware that inspects express-validator results
 * Returns 400 Bad Request with field-level details if errors exist
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return errorResponse(res, {
      statusCode: 400,
      message: formattedErrors[0].message || "Validation failed",
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = {
  validate,
};
