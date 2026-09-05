const { pool } = require("../config/mysqlDb");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get all leave types
 */
const getLeaveTypes = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM leave_types WHERE is_active = true ORDER BY id ASC;`);
    return successResponse(res, {
      statusCode: 200,
      message: "Leave types retrieved successfully.",
      data: { leave_types: rows },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get leave requests with sub-filters (All, Pending, Approved, Rejected)
 */
const getLeaveRequests = async (req, res, next) => {
  try {
    const { status, employee_id } = req.query;
    let sql = `
      SELECT 
        lr.*,
        lt.name AS leave_type_name,
        lt.code AS leave_type_code,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.designation,
        d.name AS department_name,
        u.full_name AS approver_name
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON lr.approved_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "ALL") {
      sql += ` AND lr.status = ?`;
      params.push(status);
    }
    if (employee_id) {
      sql += ` AND lr.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY lr.start_date DESC;`;

    const [requests] = await pool.query(sql, params);

    // Counts for sub-filter pills: All, Pending, Approved, Rejected
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected
      FROM leave_requests;
    `);

    return successResponse(res, {
      statusCode: 200,
      message: "Leave requests retrieved successfully.",
      data: {
        requests,
        counts: counts[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a new leave request
 */
const createLeaveRequest = async (req, res, next) => {
  try {
    const { employee_id, leave_type_id, start_date, end_date, days, reason } = req.body;
    let empId = employee_id;

    if (!empId) {
      const [u] = await pool.query(`SELECT employee_id FROM users WHERE id = ?;`, [req.user.id]);
      empId = u[0]?.employee_id;
    }

    if (!empId || !leave_type_id || !start_date || !end_date) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Employee, leave type, start date, and end date are required.",
      });
    }

    const calcDays = days || 1.0;

    const [result] = await pool.query(`
      INSERT INTO leave_requests (
        employee_id, leave_type_id, start_date, end_date, days, reason, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'Pending');
    `, [empId, leave_type_id, start_date, end_date, calcDays, reason || null]);

    const [created] = await pool.query(`SELECT * FROM leave_requests WHERE id = ?;`, [result.insertId]);

    return successResponse(res, {
      statusCode: 201,
      message: "Leave request submitted successfully.",
      data: { request: created[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or Reject a leave request (HR / Admin)
 */
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    if (!["Approved", "Rejected", "Cancelled"].includes(formattedStatus)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Status must be Approved, Rejected, or Cancelled.",
      });
    }

    await pool.query(`
      UPDATE leave_requests
      SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
      WHERE id = ?;
    `, [formattedStatus, req.user.id, rejection_reason || null, id]);

    // If approved, update leave_allocations used_days
    if (formattedStatus === "Approved") {
      const [reqData] = await pool.query(`SELECT * FROM leave_requests WHERE id = ?;`, [id]);
      if (reqData[0]) {
        await pool.query(`
          UPDATE leave_allocations
          SET used_days = used_days + ?
          WHERE employee_id = ? AND leave_type_id = ?;
        `, [reqData[0].days, reqData[0].employee_id, reqData[0].leave_type_id]);
      }
    }

    const [updated] = await pool.query(`SELECT * FROM leave_requests WHERE id = ?;`, [id]);

    return successResponse(res, {
      statusCode: 200,
      message: `Leave request has been ${formattedStatus.toLowerCase()}.`,
      data: { request: updated[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get leave balances for an employee
 */
const getLeaveBalance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const [allocations] = await pool.query(`
      SELECT 
        la.*,
        lt.name AS leave_type_name,
        lt.code AS leave_type_code,
        (la.total_days - la.used_days) AS remaining_days
      FROM leave_allocations la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.employee_id = ?;
    `, [employeeId]);

    return successResponse(res, {
      statusCode: 200,
      message: "Leave balances retrieved successfully.",
      data: { balances: allocations },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaveTypes,
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus,
  getLeaveBalance,
};
