const { pool } = require("../config/mysqlDb");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Requirement 23: Dashboard Backend with 100% real database aggregation
 */
const getPayrollDashboard = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    // 1. Total Active Employees
    const [empCount] = await pool.query(`SELECT COUNT(*) AS total FROM employees WHERE status = 'ACTIVE';`);
    const totalEmployees = empCount[0]?.total || 0;

    // 2. Fetch target payrun (latest or specified month/year)
    let payrunSql = `SELECT * FROM payruns WHERE 1=1`;
    const payrunParams = [];
    if (month && year) {
      payrunSql += ` AND month = ? AND year = ?`;
      payrunParams.push(month, year);
    }
    payrunSql += ` ORDER BY period_start DESC LIMIT 1;`;

    const [payrunRows] = await pool.query(payrunSql, payrunParams);
    const targetPayrun = payrunRows[0] || null;

    let processedCount = 0;
    let pendingCount = 0;
    let totalNetPayout = 0;
    let averageSalary = 0;

    if (targetPayrun) {
      // Processed payslips in this payrun
      const [slipStats] = await pool.query(`
        SELECT 
          COUNT(id) AS count,
          COALESCE(SUM(net_amount), 0) AS total_net,
          COALESCE(AVG(net_amount), 0) AS avg_net
        FROM payslips 
        WHERE payrun_id = ?;
      `, [targetPayrun.id]);

      processedCount = slipStats[0]?.count || 0;
      totalNetPayout = parseFloat(slipStats[0]?.total_net || 0);
      averageSalary = parseFloat(slipStats[0]?.avg_net || 0);
      pendingCount = Math.max(0, totalEmployees - processedCount);
    } else {
      pendingCount = totalEmployees;
    }

    // 3. Monthly Payroll Trend (Past 8 Months)
    const [monthlyTrend] = await pool.query(`
      SELECT 
        id,
        run_number,
        month,
        year,
        period_start,
        COALESCE(total_gross, 0) AS gross,
        COALESCE(total_net, 0) AS net,
        employee_count,
        status
      FROM payruns
      ORDER BY period_start ASC
      LIMIT 12;
    `);

    // 4. Department Wise Payroll (Based on active payslips or contracts)
    const [deptPayroll] = await pool.query(`
      SELECT 
        d.id AS department_id,
        d.name,
        d.code,
        COUNT(DISTINCT e.id) AS employee_count,
        COALESCE(SUM(c.wage), 0) AS total_wage_cost,
        COALESCE(SUM(p.net_amount), SUM(c.wage)) AS net_expenditure
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'ACTIVE'
      LEFT JOIN contracts c ON c.employee_id = e.id AND c.status = 'ACTIVE'
      LEFT JOIN payslips p ON p.employee_id = e.id ${targetPayrun ? `AND p.payrun_id = ${targetPayrun.id}` : ''}
      GROUP BY d.id
      ORDER BY net_expenditure DESC;
    `);

    // 5. Real Payroll Attention Warnings
    const warnings = [];

    // Check missing bank accounts for active employees
    const [missingBank] = await pool.query(`
      SELECT id, employee_code, CONCAT(first_name, ' ', last_name) AS name 
      FROM employees 
      WHERE status = 'ACTIVE' AND (bank_account IS NULL OR bank_account = '')
      LIMIT 5;
    `);
    for (const mb of missingBank) {
      warnings.push({
        id: `bank-${mb.id}`,
        type: "MISSING_BANK",
        severity: "warning",
        employee_id: mb.id,
        employee_name: mb.name,
        employee_code: mb.employee_code,
        message: `Missing bank account details on file.`,
        action: "Update Employee",
      });
    }

    // Check expired contracts
    const [expiredContracts] = await pool.query(`
      SELECT c.id, c.contract_number, e.employee_code, CONCAT(e.first_name, ' ', e.last_name) AS name, c.end_date
      FROM contracts c
      JOIN employees e ON c.employee_id = e.id
      WHERE c.status = 'EXPIRED' OR (c.end_date IS NOT NULL AND c.end_date < CURDATE())
      LIMIT 5;
    `);
    for (const ec of expiredContracts) {
      warnings.push({
        id: `contract-${ec.id}`,
        type: "EXPIRED_CONTRACT",
        severity: "danger",
        employee_name: ec.name,
        employee_code: ec.employee_code,
        message: `Contract ${ec.contract_number} expired on ${ec.end_date}. Requires renewal before payrun.`,
        action: "Review Contract",
      });
    }

    // 6. Recent Payroll Activity from audit_logs
    const [recentLogs] = await pool.query(`
      SELECT a.*, u.full_name, u.email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type IN ('PAYRUN', 'PAYSLIP', 'SALARY_RULE')
      ORDER BY a.created_at DESC
      LIMIT 8;
    `);

    return successResponse(res, {
      statusCode: 200,
      message: "Payroll dashboard metrics retrieved successfully.",
      data: {
        kpi: {
          total_employees: totalEmployees,
          processed_payroll: processedCount,
          pending_payroll: pendingCount,
          total_net_payout: totalNetPayout,
          average_salary: averageSalary,
          payrun: targetPayrun,
        },
        monthly_trend: monthlyTrend,
        department_payroll: deptPayroll,
        warnings,
        recent_activity: recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Requirement 24: Comprehensive Payroll Reports Backend
 */
const getPayrollReports = async (req, res, next) => {
  try {
    const { report_type = "summary", payrun_id, department_id } = req.query;

    let targetPayrunId = payrun_id;
    if (!targetPayrunId) {
      const [latest] = await pool.query(`SELECT id FROM payruns ORDER BY period_start DESC LIMIT 1;`);
      targetPayrunId = latest[0]?.id;
    }

    if (report_type === "department") {
      const [deptReport] = await pool.query(`
        SELECT 
          d.id,
          d.name AS department,
          COUNT(p.id) AS employees,
          COALESCE(SUM(p.gross_amount), 0) AS total_gross,
          COALESCE(SUM(p.deduction_amount), 0) AS total_deductions,
          COALESCE(SUM(p.net_amount), 0) AS payroll_cost,
          COALESCE(AVG(p.net_amount), 0) AS avg_salary
        FROM departments d
        LEFT JOIN employees e ON e.department_id = d.id
        LEFT JOIN payslips p ON p.employee_id = e.id AND p.payrun_id = ?
        GROUP BY d.id
        ORDER BY payroll_cost DESC;
      `, [targetPayrunId || 0]);

      return successResponse(res, {
        statusCode: 200,
        message: "Department payroll report retrieved.",
        data: { report: deptReport },
      });
    }

    if (report_type === "earnings") {
      const [earningsReport] = await pool.query(`
        SELECT 
          pl.rule_code,
          pl.rule_name,
          pl.category,
          COUNT(pl.id) AS occurrences,
          SUM(pl.amount) AS total_amount
        FROM payslip_lines pl
        JOIN payslips p ON pl.payslip_id = p.id
        WHERE p.payrun_id = ?
        GROUP BY pl.rule_code, pl.rule_name, pl.category
        ORDER BY pl.category ASC, total_amount DESC;
      `, [targetPayrunId || 0]);

      return successResponse(res, {
        statusCode: 200,
        message: "Earnings and deductions report retrieved.",
        data: { report: earningsReport },
      });
    }

    if (report_type === "tax") {
      const [taxReport] = await pool.query(`
        SELECT 
          e.employee_code,
          CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
          COALESCE(e.pan_number, 'NOT PROVIDED') AS pan_number,
          p.gross_amount AS taxable_gross,
          COALESCE(SUM(CASE WHEN pl.rule_code = 'TDS' THEN pl.amount ELSE 0 END), 0) AS tds_deducted,
          COALESCE(SUM(CASE WHEN pl.rule_code = 'PT' THEN pl.amount ELSE 0 END), 0) AS pt_deducted,
          p.status
        FROM payslips p
        JOIN employees e ON p.employee_id = e.id
        LEFT JOIN payslip_lines pl ON pl.payslip_id = p.id
        WHERE p.payrun_id = ?
        GROUP BY p.id, e.id;
      `, [targetPayrunId || 0]);

      return successResponse(res, {
        statusCode: 200,
        message: "Tax compliance report retrieved.",
        data: { report: taxReport },
      });
    }

    if (report_type === "bank") {
      const [bankReport] = await pool.query(`
        SELECT 
          e.employee_code,
          CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
          e.bank_account,
          p.net_amount,
          p.payment_status,
          p.status
        FROM payslips p
        JOIN employees e ON p.employee_id = e.id
        WHERE p.payrun_id = ?
        ORDER BY e.employee_code ASC;
      `, [targetPayrunId || 0]);

      return successResponse(res, {
        statusCode: 200,
        message: "Bank transfer disbursement report retrieved.",
        data: { report: bankReport },
      });
    }

    // Default: Summary report
    const [summaryStats] = await pool.query(`
      SELECT 
        COUNT(p.id) AS total_employees_paid,
        COALESCE(SUM(p.gross_amount), 0) AS total_gross,
        COALESCE(SUM(p.deduction_amount), 0) AS total_deductions,
        COALESCE(SUM(p.net_amount), 0) AS total_net_payout,
        COALESCE(AVG(p.net_amount), 0) AS avg_salary
      FROM payslips p
      WHERE p.payrun_id = ?;
    `, [targetPayrunId || 0]);

    return successResponse(res, {
      statusCode: 200,
      message: "Payroll summary report retrieved.",
      data: { summary: summaryStats[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Backward-compatible Admin Analytics
 */
const getAdminAnalytics = async (req, res, next) => {
  return getPayrollDashboard(req, res, next);
};

/**
 * Backward-compatible HR Analytics
 */
const getHrAnalytics = async (req, res, next) => {
  try {
    const [deptHeadcount] = await pool.query(`
      SELECT d.name, d.code, COUNT(e.id) AS count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'ACTIVE'
      GROUP BY d.id;
    `);

    const [attendanceToday] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) AS half_day
      FROM attendance
      WHERE attendance_date = CURDATE();
    `);

    const [pendingLeaves] = await pool.query(`
      SELECT lr.*, e.employee_code, CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.status = 'Pending'
      ORDER BY lr.start_date ASC;
    `);

    return successResponse(res, {
      statusCode: 200,
      message: "HR analytics retrieved successfully.",
      data: {
        departmentHeadcount: deptHeadcount,
        attendanceToday: attendanceToday[0] || { total: 0, present: 0, absent: 0, half_day: 0 },
        pendingLeaves,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Backward-compatible Payroll Analytics
 */
const getPayrollAnalytics = async (req, res, next) => {
  return getPayrollDashboard(req, res, next);
};

module.exports = {
  getPayrollDashboard,
  getPayrollReports,
  getAdminAnalytics,
  getHrAnalytics,
  getPayrollAnalytics,
};
