const { verifyToken } = require("../utils/jwt");
const { errorResponse } = require("../utils/apiResponse");
const { pool } = require("../config/mysqlDb");

/**
 * HR Manager Authorization Middleware
 * Strict database verification: verifies that the authenticated user actually holds
 * the 'HR_MANAGER' or 'ADMIN' role in the database.
 */
const requireHrManager = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check httpOnly cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Bearer token in header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Authentication required. Please log in as an HR Manager.",
      });
    }

    // 3. Verify JWT
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Invalid session token. Please log in again.",
      });
    }

    // 4. Strict Database Verification (Do not trust frontend or stale token payloads)
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role_id, r.code AS role, u.is_active
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.is_active = true
       LIMIT 1`,
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return errorResponse(res, {
        statusCode: 401,
        message: "User account not found or deactivated.",
      });
    }

    const dbUser = rows[0];

    // Enforce HR_MANAGER or ADMIN
    if (dbUser.role !== "HR_MANAGER" && dbUser.role !== "ADMIN") {
      return errorResponse(res, {
        statusCode: 403,
        message: "Forbidden: Only authorized HR Managers can access this module.",
      });
    }

    // Attach validated database user to request
    req.user = dbUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, {
        statusCode: 401,
        message: "Your session has expired. Please log in again.",
      });
    }

    return errorResponse(res, {
      statusCode: 401,
      message: "Authentication failed. " + error.message,
    });
  }
};

module.exports = {
  requireHrManager,
};
