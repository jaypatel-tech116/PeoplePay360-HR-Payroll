const { verifyToken } = require("../utils/jwt");
const { errorResponse } = require("../utils/apiResponse");

const { pool } = require("../config/mysqlDb");

/**
 * Server-side authentication middleware
 * Verifies JWT token from httpOnly cookie or Authorization Bearer header
 */
const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check httpOnly cookie first (primary auth mechanism)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization header if provided
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Authentication required. Please log in.",
      });
    }

    // Verify token using JWT_SECRET
    const decoded = verifyToken(token);

    let employeeId = decoded.employee_id || null;

    // If employee_id is missing from token payload, resolve directly from database
    if (!employeeId && decoded.id) {
      try {
        const [uRows] = await pool.query(
          "SELECT employee_id FROM users WHERE id = ? LIMIT 1",
          [decoded.id]
        );
        if (uRows.length && uRows[0].employee_id) {
          employeeId = uRows[0].employee_id;
        }
      } catch (dbErr) {
        console.error("Failed to query employee_id in requireAuth:", dbErr);
      }
    }

    // Attach decoded user payload to request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
      employee_id: employeeId,
    };

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
      message: "Invalid or corrupted authentication token.",
    });
  }
};

module.exports = {
  requireAuth,
  authenticateToken: requireAuth,
};
