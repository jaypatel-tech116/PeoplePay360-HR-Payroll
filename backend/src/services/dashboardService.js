const { query } = require('../config/db');

/**
 * Live Dashboard Aggregation Service
 * Supports dynamic filtering by:
 * - period (year-month or date range)
 * - departmentId
 * - employeeType (User Correction #1)
 */
async function getDashboardData(filters = {}) {
  const { period, departmentId, employeeType } = filters;

  // Build employee filter clauses
  let empWhere = ['1=1'];
  let empParams = [];
  let paramIdx = 1;

  if (departmentId && departmentId !== 'all') {
    empWhere.push(`e.department_id = $${paramIdx}`);
    empParams.push(parseInt(departmentId, 10));
    paramIdx++;
  }

  if (employeeType && employeeType !== 'all') {
    empWhere.push(`e.employee_type = $${paramIdx}`);
    empParams.push(employeeType);
    paramIdx++;
  }

  const empFilterSql = empWhere.join(' AND ');

  // 1. KPI Cards
  // Total Net Salary Paid
  const netPaidRes = await query(
    `SELECT COALESCE(SUM(p.net_amount), 0) AS total_net_paid,
            COUNT(p.id) AS total_payslips,
            COALESCE(AVG(p.net_amount), 0) AS avg_salary
     FROM payslips p
     JOIN employees e ON p.employee_id = e.id
     JOIN payruns pr ON p.payrun_id = pr.id
     WHERE p.status = 'paid' AND ${empFilterSql}`,
    empParams
  );

  // Approved Time Off
  const timeOffKpiRes = await query(
    `SELECT COALESCE(SUM(r.duration), 0) AS approved_leave_days,
            COUNT(*) FILTER (WHERE r.status = 'submitted') AS pending_leave_requests
     FROM time_off_requests r
     JOIN employees e ON r.employee_id = e.id
     WHERE r.status = 'approved' AND ${empFilterSql}`,
    empParams
  );

  // Attendance Health
  const attKpiRes = await query(
    `SELECT COUNT(*) AS total_attendances,
            COUNT(*) FILTER (WHERE a.status = 'normal') AS normal_count,
            COUNT(*) FILTER (WHERE a.status = 'late') AS late_count,
            COUNT(*) FILTER (WHERE a.status = 'overtime') AS overtime_count,
            COUNT(*) FILTER (WHERE a.status = 'missing_checkout') AS missing_checkout_count,
            COUNT(*) FILTER (WHERE a.status = 'corrected') AS corrected_count
     FROM attendances a
     JOIN employees e ON a.employee_id = e.id
     WHERE ${empFilterSql}`,
    empParams
  );

  const totalAtt = parseInt(attKpiRes.rows[0].total_attendances || 0, 10);
  const normalAtt = parseInt(attKpiRes.rows[0].normal_count || 0, 10);
  const attHealthPct = totalAtt > 0 ? Math.round((normalAtt / totalAtt) * 100) : 100;

  // 2. Charts
  // Salary Cost by Department
  const deptCostRes = await query(
    `SELECT d.name AS department,
            COUNT(DISTINCT e.id) AS headcount,
            COALESCE(SUM(c.wage), 0) AS total_wage,
            COALESCE(SUM(p.net_amount), 0) AS total_net_expenditure
     FROM departments d
     LEFT JOIN employees e ON e.department_id = d.id AND ${empFilterSql}
     LEFT JOIN contracts c ON c.employee_id = e.id AND c.status = 'active'
     LEFT JOIN payslips p ON p.employee_id = e.id AND p.status = 'paid'
     GROUP BY d.id, d.name
     ORDER BY d.name ASC`,
    empParams
  );

  // Monthly Net Salary Trend
  const trendRes = await query(
    `SELECT TO_CHAR(pr.period_start, 'Mon YYYY') AS month_label,
            DATE_TRUNC('month', pr.period_start) AS month_date,
            COALESCE(SUM(p.net_amount), 0) AS monthly_net_total,
            COALESCE(SUM(p.gross_amount), 0) AS monthly_gross_total,
            COUNT(p.id) AS payslip_count
     FROM payruns pr
     JOIN payslips p ON p.payrun_id = pr.id
     JOIN employees e ON p.employee_id = e.id
     WHERE p.status = 'paid' AND ${empFilterSql}
     GROUP BY DATE_TRUNC('month', pr.period_start), TO_CHAR(pr.period_start, 'Mon YYYY')
     ORDER BY month_date ASC`,
    empParams
  );

  // 3. Operational Alerts
  // Unverified/Missing bank details
  const missingBankEmps = await query(
    `SELECT e.id, e.full_name, e.email, e.bank_account_number, e.ifsc_code, e.bank_verified
     FROM employees e
     WHERE (e.bank_account_number IS NULL OR e.ifsc_code IS NULL OR e.bank_verified = false)
       AND e.status = 'active' AND ${empFilterSql}`,
    empParams
  );

  // Draft / uncomputed payruns
  const pendingPayrunsRes = await query(
    `SELECT id, name, status, period_start, period_end, total_gross, total_net
     FROM payruns
     WHERE status IN ('draft', 'computed')
     ORDER BY period_start DESC`
  );

  // Expiring contracts
  const expiringContractsRes = await query(
    `SELECT c.id, e.full_name, c.end_date, c.wage
     FROM contracts c
     JOIN employees e ON c.employee_id = e.id
     WHERE c.status = 'active'
       AND c.end_date IS NOT NULL
       AND c.end_date <= CURRENT_DATE + INTERVAL '60 days'
       AND ${empFilterSql}`,
    empParams
  );

  // Active employees without active contracts
  const missingContractsRes = await query(
    `SELECT e.id, e.full_name, e.email
     FROM employees e
     WHERE e.status = 'active'
       AND NOT EXISTS (
         SELECT 1 FROM contracts c WHERE c.employee_id = e.id AND c.status = 'active'
       )
       AND ${empFilterSql}`,
    empParams
  );

  // Active warnings on payruns
  const payrunWarningsRes = await query(
    `SELECT pw.type, pw.message, pr.name AS payrun_name, e.full_name AS employee_name
     FROM payslip_warnings pw
     JOIN payslips p ON pw.payslip_id = p.id
     JOIN payruns pr ON p.payrun_id = pr.id
     JOIN employees e ON p.employee_id = e.id
     WHERE pr.status IN ('draft', 'computed')
     LIMIT 10`
  );

  return {
    kpis: {
      totalNetPaid: parseFloat(netPaidRes.rows[0].total_net_paid || 0),
      totalPayslips: parseInt(netPaidRes.rows[0].total_payslips || 0, 10),
      avgSalary: parseFloat(netPaidRes.rows[0].avg_salary || 0),
      approvedLeaveDays: parseFloat(timeOffKpiRes.rows[0].approved_leave_days || 0),
      pendingLeaveRequests: parseInt(timeOffKpiRes.rows[0].pending_leave_requests || 0, 10),
      attendanceHealthPct: attHealthPct,
      attendanceStats: attKpiRes.rows[0]
    },
    charts: {
      deptCosts: deptCostRes.rows,
      monthlyTrend: trendRes.rows
    },
    alerts: {
      missingBankCount: missingBankEmps.rows.length,
      missingBankEmployees: missingBankEmps.rows,
      pendingPayruns: pendingPayrunsRes.rows,
      expiringContracts: expiringContractsRes.rows,
      missingContracts: missingContractsRes.rows,
      activeWarnings: payrunWarningsRes.rows
    }
  };
}

module.exports = { getDashboardData };
