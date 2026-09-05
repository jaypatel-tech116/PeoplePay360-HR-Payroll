const { pool } = require("../config/mysqlDb");
const payrollEngine = require("../services/payroll-engine.service");
const { generatePayslipHtml } = require("../services/payslip-pdf.service");
const { sendPayrunPayslips } = require("../services/payroll-email.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { logAudit } = require("../utils/auditLogger");

/**
 * List all payruns (pay cycles)
 */
const getPayruns = async (req, res, next) => {
  try {
    const { year, status } = req.query;
    let sql = `
      SELECT 
        pr.*,
        ss.name AS salary_structure_name
      FROM payruns pr
      LEFT JOIN salary_structures ss ON pr.salary_structure_id = ss.id
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      sql += ` AND (pr.year = ? OR YEAR(pr.period_start) = ?)`;
      params.push(year, year);
    }
    if (status && status !== "ALL") {
      sql += ` AND pr.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY pr.period_start DESC;`;

    const [rows] = await pool.query(sql, params);
    return successResponse(res, {
      statusCode: 200,
      message: "Payruns retrieved successfully.",
      data: { payruns: rows },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single payrun by ID
 */
const getPayrunById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payrun = await payrollEngine.getPayrunById(id);

    if (!payrun) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Payrun not found.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Payrun details retrieved successfully.",
      data: { payrun },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new payrun (Draft)
 */
const createPayrun = async (req, res, next) => {
  try {
    const {
      period_start,
      period_end,
      pay_date,
      salary_structure_id,
      month,
      year,
      employee_ids,
    } = req.body;

    const created = await payrollEngine.createPayrun({
      salary_structure_id: salary_structure_id || 1,
      period_start,
      period_end,
      pay_date,
      employee_ids: employee_ids || [],
      month,
      year,
      user_id: req.user?.id,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Payrun created in Draft state.",
      data: { payrun: created },
    });
  } catch (error) {
    if (error.code === "DUPLICATE_PAYRUN" || error.code === "INVALID_PERIOD") {
      return errorResponse(res, {
        statusCode: 400,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Compute salary rules & itemized payslips for payrun
 */
const computePayrun = async (req, res, next) => {
  try {
    const { id } = req.params;
    const computed = await payrollEngine.computePayrun(id, req.user?.id);

    return successResponse(res, {
      statusCode: 200,
      message: "Payroll computation completed successfully.",
      data: { payrun: computed },
    });
  } catch (error) {
    if (error.code === "PAYRUN_ALREADY_PAID") {
      return errorResponse(res, {
        statusCode: 400,
        message: error.message,
      });
    }
    if (error.code === "COMPUTE_VALIDATION_FAILED") {
      return errorResponse(res, {
        statusCode: 422,
        message: error.message,
        errors: error.details,
      });
    }
    next(error);
  }
};

/**
 * Validate payrun against 7-point payroll audit rules
 */
const validatePayrun = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await payrollEngine.validatePayrun(id, req.user?.id);

    return successResponse(res, {
      statusCode: 200,
      message: result.valid ? "Payrun validated successfully." : "Payrun validation completed with errors.",
      data: result,
    });
  } catch (error) {
    if (error.code === "PAYRUN_NOT_COMPUTED") {
      return errorResponse(res, {
        statusCode: 400,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Mark payrun as PAID
 */
const markPayrunPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paid = await payrollEngine.markPayrunPaid(id, req.user?.id);

    return successResponse(res, {
      statusCode: 200,
      message: "Payrun marked as Paid successfully.",
      data: { payrun: paid },
    });
  } catch (error) {
    if (error.code === "INVALID_STATUS_TRANSITION") {
      return errorResponse(res, {
        statusCode: 400,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Bulk email payslips to employees
 */
const sendPayslips = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await sendPayrunPayslips(id, req.user?.id);

    return successResponse(res, {
      statusCode: 200,
      message: `Payslips dispatched: ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete payrun (Blocked if PAID!)
 */
const deletePayrun = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [payruns] = await pool.query(`SELECT * FROM payruns WHERE id = ?;`, [id]);
    const payrun = payruns[0];
    if (!payrun) {
      return errorResponse(res, { statusCode: 404, message: "Payrun not found." });
    }

    if (payrun.status === "Paid" || payrun.status === "Completed") {
      return errorResponse(res, {
        statusCode: 400,
        message: "Historical Protection: Cannot delete or modify a payrun that has already been PAID.",
      });
    }

    await pool.query(`DELETE FROM payslips WHERE payrun_id = ?;`, [id]);
    await pool.query(`DELETE FROM payruns WHERE id = ?;`, [id]);

    await logAudit({
      userId: req.user?.id,
      action: "PAYRUN_DELETED",
      entityType: "PAYRUN",
      entityId: id,
      oldData: payrun,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Payrun deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all payslips with filters
 */
const getPayslips = async (req, res, next) => {
  try {
    const { payrun_id, employee_id, status } = req.query;
    let sql = `
      SELECT 
        p.*,
        pr.run_number,
        pr.month,
        pr.year,
        pr.pay_date,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.designation,
        d.name AS department_name,
        ss.name AS salary_structure_name
      FROM payslips p
      JOIN payruns pr ON p.payrun_id = pr.id
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN contracts c ON p.contract_id = c.id
      LEFT JOIN salary_structures ss ON p.salary_structure_id = ss.id
      WHERE 1=1
    `;
    const params = [];

    // If request user is EMPLOYEE, strictly limit to their own employee_id
    if (req.user && req.user.role === "EMPLOYEE") {
      sql += ` AND p.employee_id = ?`;
      params.push(req.user.employee_id);
    } else {
      if (payrun_id) {
        sql += ` AND p.payrun_id = ?`;
        params.push(payrun_id);
      }
      if (employee_id) {
        sql += ` AND p.employee_id = ?`;
        params.push(employee_id);
      }
    }

    if (status && status !== "ALL") {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY p.id ASC;`;

    const [payslips] = await pool.query(sql, params);

    return successResponse(res, {
      statusCode: 200,
      message: "Payslips retrieved successfully.",
      data: { payslips, total: payslips.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed payslip by ID with all itemized lines
 * Strictly enforces that employees can only view their own payslips
 */
const getPayslipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [slips] = await pool.query(`
      SELECT 
        p.*,
        pr.run_number,
        pr.month,
        pr.year,
        pr.pay_date,
        e.employee_code,
        e.first_name,
        e.last_name,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.email,
        e.designation,
        e.pan_number,
        e.uan_number,
        e.bank_account,
        d.name AS department_name,
        ss.name AS salary_structure_name
      FROM payslips p
      JOIN payruns pr ON p.payrun_id = pr.id
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN salary_structures ss ON p.salary_structure_id = ss.id
      WHERE p.id = ? OR p.payslip_number = ?
      LIMIT 1;
    `, [id, id]);

    const payslip = slips[0];
    if (!payslip) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Payslip not found.",
      });
    }

    // Role-based security check: Employee can strictly view only their own payslip
    if (req.user && req.user.role === "EMPLOYEE") {
      const myEmpId = req.user.employee_id;
      if (!myEmpId || parseInt(payslip.employee_id) !== parseInt(myEmpId)) {
        return errorResponse(res, {
          statusCode: 403,
          message: "Forbidden: You cannot access another employee's payslip.",
        });
      }
    }

    // Fetch itemized lines
    const [lines] = await pool.query(`
      SELECT * FROM payslip_lines 
      WHERE payslip_id = ?
      ORDER BY sequence ASC, id ASC;
    `, [payslip.id]);

    const earnings = lines.filter((l) => l.category === "BASIC" || l.category === "ALLOWANCE");
    const deductions = lines.filter((l) => l.category === "DEDUCTION");

    return successResponse(res, {
      statusCode: 200,
      message: "Payslip details retrieved successfully.",
      data: {
        payslip: {
          ...payslip,
          earnings,
          deductions,
          lines,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get printable payslip document HTML
 */
const getPayslipPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [slips] = await pool.query(`
      SELECT 
        p.*,
        pr.run_number,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.designation,
        e.bank_account,
        d.name AS department_name
      FROM payslips p
      JOIN payruns pr ON p.payrun_id = pr.id
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.id = ? OR p.payslip_number = ?
      LIMIT 1;
    `, [id, id]);

    const payslip = slips[0];
    if (!payslip) {
      return errorResponse(res, { statusCode: 404, message: "Payslip not found." });
    }

    if (req.user && req.user.role === "EMPLOYEE" && parseInt(payslip.employee_id) !== parseInt(req.user.employee_id)) {
      return errorResponse(res, { statusCode: 403, message: "Forbidden: You cannot access this payslip." });
    }

    const [lines] = await pool.query(
      `SELECT * FROM payslip_lines WHERE payslip_id = ? ORDER BY sequence ASC;`,
      [payslip.id]
    );

    const html = generatePayslipHtml(payslip, lines);
    res.setHeader("Content-Type", "text/html");
    return res.send(html);
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 25: getEmployeePayrollSummary(employeeId)
 */
const getEmployeePayrollSummary = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    // Authorization check
    if (req.user && req.user.role === "EMPLOYEE" && parseInt(employeeId) !== parseInt(req.user.employee_id)) {
      return errorResponse(res, { statusCode: 403, message: "Forbidden: You cannot access another employee's summary." });
    }

    const [empRows] = await pool.query(`
      SELECT 
        e.*,
        d.name AS department_name,
        s.name AS schedule_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN working_schedules s ON e.schedule_id = s.id
      WHERE e.id = ?;
    `, [employeeId]);
    const employee = empRows[0];
    if (!employee) {
      return errorResponse(res, { statusCode: 404, message: "Employee not found." });
    }

    // Active contract
    const [contractRows] = await pool.query(`
      SELECT c.*, ss.name AS salary_structure_name 
      FROM contracts c
      LEFT JOIN salary_structures ss ON c.salary_structure_id = ss.id
      WHERE c.employee_id = ? AND c.status = 'ACTIVE'
      ORDER BY c.start_date DESC LIMIT 1;
    `, [employeeId]);

    // Latest payslip
    const [slipRows] = await pool.query(`
      SELECT p.*, pr.run_number 
      FROM payslips p
      JOIN payruns pr ON p.payrun_id = pr.id
      WHERE p.employee_id = ?
      ORDER BY p.period_end DESC LIMIT 1;
    `, [employeeId]);

    // Attendance summary
    const [attRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_logs,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_days
      FROM attendance WHERE employee_id = ?;
    `, [employeeId]);

    // Leave summary
    const [leaveRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_requests,
        SUM(CASE WHEN status = 'Approved' THEN days ELSE 0 END) AS approved_leave_days
      FROM leave_requests WHERE employee_id = ?;
    `, [employeeId]);

    return successResponse(res, {
      statusCode: 200,
      message: "Employee payroll summary retrieved successfully.",
      data: {
        employee,
        department: employee.department_name,
        designation: employee.designation,
        active_contract: contractRows[0] || null,
        current_wage: contractRows[0]?.wage || 0,
        salary_structure: contractRows[0]?.salary_structure_name || null,
        latest_payslip: slipRows[0] || null,
        attendance_summary: attRows[0] || null,
        leave_summary: leaveRows[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayruns,
  getPayrunById,
  createPayrun,
  computePayrun,
  validatePayrun,
  markPayrunPaid,
  sendPayslips,
  deletePayrun,
  getPayslips,
  getPayslipById,
  getPayslipPdf,
  getEmployeePayrollSummary,
};
