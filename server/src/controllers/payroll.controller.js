const { pool } = require("../config/mysqlDb");
const payrollEngine = require("../services/payroll-engine.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

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
 * Create a new payrun (Step 1-4 Wizard)
 */
const createPayrun = async (req, res, next) => {
  try {
    const { period_start, period_end, pay_date, salary_structure_id, month, year } = req.body;
    if (!period_start || !period_end || !pay_date) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Period start, period end, and pay date are required.",
      });
    }

    const pDate = new Date(period_end);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const mName = month || monthNames[pDate.getMonth()];
    const yVal = year || String(pDate.getFullYear());

    const runNum = `PR-${yVal}-${String(pDate.getMonth() + 1).padStart(2, "0")}`;

    const [result] = await pool.query(`
      INSERT INTO payruns (
        run_number, month, year, pay_date, salary_structure_id,
        period_start, period_end, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft', ?);
    `, [
      runNum,
      mName,
      yVal,
      pay_date,
      salary_structure_id || 1,
      period_start,
      period_end,
      req.user.id,
    ]);

    const created = await payrollEngine.getPayrunById(result.insertId);

    return successResponse(res, {
      statusCode: 201,
      message: "Pay cycle created in draft state.",
      data: { payrun: created },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compute payrun calculations
 */
const computePayrun = async (req, res, next) => {
  try {
    const { id } = req.params;
    const computed = await payrollEngine.computePayrun(id);

    return successResponse(res, {
      statusCode: 200,
      message: "Payroll computation completed successfully.",
      data: { payrun: computed },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate and lock payrun
 */
const validatePayrun = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = await payrollEngine.validatePayrun(id);

    return successResponse(res, {
      statusCode: 200,
      message: "Payrun validated and locked.",
      data: { payrun: validated },
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

    if (payrun_id) {
      sql += ` AND p.payrun_id = ?`;
      params.push(payrun_id);
    }
    if (employee_id) {
      sql += ` AND p.employee_id = ?`;
      params.push(employee_id);
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

    // Role-based security check: Employees can strictly view their own payslip
    if (req.user && req.user.role === "EMPLOYEE") {
      const [uRows] = await pool.query(`SELECT employee_id FROM users WHERE id = ?`, [req.user.id]);
      const myEmpId = uRows[0]?.employee_id;
      if (!myEmpId || parseInt(payslip.employee_id) !== parseInt(myEmpId)) {
        return errorResponse(res, {
          statusCode: 403,
          message: "Forbidden: You cannot access another employee's payslip.",
        });
      }
    }

    // Fetch line items
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

module.exports = {
  getPayruns,
  getPayrunById,
  createPayrun,
  computePayrun,
  validatePayrun,
  getPayslips,
  getPayslipById,
};
