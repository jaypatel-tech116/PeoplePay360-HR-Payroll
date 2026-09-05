const { pool } = require("../config/mysqlDb");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get attendance records with 4 KPI cards
 */
const getAttendance = async (req, res, next) => {
  try {
    const { date, department_id, employee_id } = req.query;

    let sql = `
      SELECT 
        a.*,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.designation,
        d.name AS department_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      sql += ` AND a.attendance_date = ?`;
      params.push(date);
    }
    if (department_id) {
      sql += ` AND e.department_id = ?`;
      params.push(department_id);
    }
    if (employee_id) {
      sql += ` AND a.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY a.attendance_date DESC, a.check_in ASC;`;

    const [attendance] = await pool.query(sql, params);

    // KPI stats across total records
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_records,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
        SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) AS half_day_count,
        SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) AS on_leave_count,
        AVG(worked_hours) AS avg_worked_hours
      FROM attendance;
    `);

    return successResponse(res, {
      statusCode: 200,
      message: "Attendance records retrieved successfully.",
      data: {
        attendance,
        kpi: stats[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Punch In / Punch Out for an employee
 */
const punch = async (req, res, next) => {
  try {
    const body = req.body || {};
    let employeeId = body.employee_id;

    if (!employeeId) {
      const [u] = await pool.query(`SELECT employee_id FROM users WHERE id = ?;`, [req.user.id]);
      employeeId = u[0]?.employee_id;
    }

    if (!employeeId) {
      return errorResponse(res, {
        statusCode: 400,
        message: "No employee profile associated with this account.",
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const [existing] = await pool.query(
      `SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?;`,
      [employeeId, today]
    );

    const action = body.action ? String(body.action).toUpperCase() : null;

    if (action === "IN") {
      if (existing.length > 0 && !existing[0].check_out) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Already checked in today. Please check out first before checking in again.",
        });
      }
      if (existing.length > 0 && existing[0].check_out) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Daily attendance has already been completed for today.",
        });
      }
    }

    if (action === "OUT") {
      if (existing.length === 0) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Cannot check out without checking in first.",
        });
      }
      if (existing[0].check_out) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Already checked out today.",
        });
      }
    }

    if (existing.length === 0) {
      // Punch In
      await pool.query(`
        INSERT INTO attendance (employee_id, attendance_date, check_in, worked_hours, overtime_hours, status)
        VALUES (?, ?, NOW(), 0.00, 0.00, 'Present');
      `, [employeeId, today]);

      const [record] = await pool.query(
        `SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?;`,
        [employeeId, today]
      );

      return successResponse(res, {
        statusCode: 200,
        message: "Punched in successfully.",
        data: { action: "PUNCH_IN", record: record[0] },
      });
    } else {
      if (existing[0].check_out) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Daily attendance has already been completed for today.",
        });
      }

      // Punch Out
      const checkInTime = existing[0].check_in ? new Date(existing[0].check_in) : new Date();
      const diffMs = now.getTime() - checkInTime.getTime();
      const hours = Math.max(0.01, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));

      await pool.query(`
        UPDATE attendance 
        SET check_out = NOW(), worked_hours = ? 
        WHERE employee_id = ? AND attendance_date = ?;
      `, [hours, employeeId, today]);

      const [record] = await pool.query(
        `SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?;`,
        [employeeId, today]
      );

      return successResponse(res, {
        statusCode: 200,
        message: `Punched out successfully. Worked hours: ${hours}`,
        data: { action: "PUNCH_OUT", record: record[0] },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  punch,
};
