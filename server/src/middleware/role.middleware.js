const { pool } = require("../config/mysqlDb");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Role-based authorization middleware
 * Verifies authenticated user against database and enforces role boundaries
 *
 * Roles:
 * - ADMIN: Full system administrator
 * - HR_PAYROLL_MANAGER: Full payroll CRUD & configuration management
 * - HR_PAYROLL_USER: Operational payroll access (cannot mutate salary rules/structures)
 * - HR_MANAGER: HR master data & leave administration
 * - EMPLOYEE: Self-service only (own records)
 *
 * @param {string[]} allowedRoles
 */
const requireRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return errorResponse(res, {
          statusCode: 401,
          message: "Authentication required.",
        });
      }

      // Fetch fresh role and employee linkage from database to prevent stale token bypass
      const [rows] = await pool.query(
        `SELECT u.id, u.email, u.full_name, u.role_id, r.code AS role, u.employee_id, u.is_active
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = ? AND u.is_active = true
         LIMIT 1`,
        [req.user.id]
      );

      if (!rows || rows.length === 0) {
        return errorResponse(res, {
          statusCode: 401,
          message: "User account not found or has been deactivated.",
        });
      }

      const dbUser = rows[0];
      req.user = dbUser; // Attach fresh database user record

      // ADMIN has full platform access
      if (dbUser.role === "ADMIN") {
        return next();
      }

      // Check if user's role is in the allowed roles list
      if (!allowedRoles.includes(dbUser.role)) {
        return errorResponse(res, {
          statusCode: 403,
          message: `Forbidden: Role '${dbUser.role}' is not authorized to perform this operation.`,
        });
      }

      next();
    } catch (error) {
      return errorResponse(res, {
        statusCode: 500,
        message: "Authorization verification failed: " + error.message,
      });
    }
  };
};

module.exports = {
  requireRole,
};
