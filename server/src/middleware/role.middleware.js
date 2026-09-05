const { errorResponse } = require("../utils/apiResponse");

/**
 * Role-based authorization middleware
 * @param {string[]} allowedRoles
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== "ADMIN") {
      return errorResponse(res, {
        statusCode: 403,
        message: "Forbidden: You do not have permission to access this resource.",
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};
