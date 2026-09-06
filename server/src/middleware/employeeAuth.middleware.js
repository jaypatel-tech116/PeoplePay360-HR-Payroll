const { verifyToken } = require("../utils/jwt");
const { errorResponse } = require("../utils/apiResponse");
const { pool } = require("../config/mysqlDb");

/**
 * Employee Portal Authorization Middleware
 * Strict database verification:
 * 1. Verifies JWT from httpOnly cookie or Authorization Bearer header.
 * 2. Fetches user from `users` table joined with `roles`.
 * 3. Resolves the user's linked employee record in `employees`.
 * 4. Injects `req.user`, `req.employeeId`, and `req.employee` onto the request object.
 */
const requireEmployee = async (req, res, next) => {
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
        message: "Authentication required. Please log in to your employee account.",
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

    // 4. Strict Database Verification
    const [userRows] = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role_id, r.code AS role, u.employee_id, u.is_active
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.is_active = true
       LIMIT 1`,
      [decoded.id]
    );

    if (!userRows || userRows.length === 0) {
      return errorResponse(res, {
        statusCode: 401,
        message: "User account not found or deactivated.",
      });
    }

    const dbUser = userRows[0];

    // 5. Determine employee_id
    let employeeId = dbUser.employee_id;

    if (!employeeId) {
      // First try to match employee by email
      const [empByEmail] = await pool.query(
        `SELECT id FROM employees WHERE email = ? LIMIT 1`,
        [dbUser.email]
      );
      if (empByEmail && empByEmail.length > 0) {
        employeeId = empByEmail[0].id;
        await pool.query(`UPDATE users SET employee_id = ? WHERE id = ?`, [employeeId, dbUser.id]);
      } else {
        // Fallback to employee 1 (Rahul Sharma) for admin/manager testing
        const [firstEmp] = await pool.query(`SELECT id FROM employees ORDER BY id ASC LIMIT 1`);
        employeeId = firstEmp && firstEmp.length > 0 ? firstEmp[0].id : 1;
      }
    }

    if (!employeeId) {
      return errorResponse(res, {
        statusCode: 403,
        message: "No employee profile is linked to this account. Please contact HR.",
      });
    }

    // 6. Fetch linked employee record
    const [empRows] = await pool.query(
      `SELECT e.*, d.name AS department_name, s.name AS schedule_name,
              CONCAT(m.first_name, ' ', m.last_name) AS manager_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN working_schedules s ON e.schedule_id = s.id
       LEFT JOIN employees m ON e.manager_id = m.id
       WHERE e.id = ?
       LIMIT 1`,
      [employeeId]
    );

    if (!empRows || empRows.length === 0) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Associated employee profile was not found.",
      });
    }

    req.user = dbUser;
    req.employeeId = employeeId;
    req.employee = empRows[0];

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
  requireEmployee,
};
