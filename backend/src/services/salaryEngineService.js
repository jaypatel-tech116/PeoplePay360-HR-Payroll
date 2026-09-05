const { Parser } = require('expr-eval');
const { query } = require('../config/db');
const { resolveContractForPeriod } = require('./contractResolverService');

const parser = new Parser();

/**
 * Calculates connected operational statistics for an employee in a payrun period:
 * - Actual worked days from attendances
 * - Total worked hours
 * - Approved paid leaves
 * - Approved unpaid leaves (which affect payroll)
 */
async function calculateOperationalDays(employeeId, periodStart, periodEnd) {
  // 1. Query attendances in period
  const attRes = await query(
    `SELECT COUNT(DISTINCT DATE(check_in)) AS attended_days,
            COALESCE(SUM(worked_hours), 0) AS total_hours,
            COUNT(*) FILTER (WHERE status = 'missing_checkout') AS missing_checkouts
     FROM attendances
     WHERE employee_id = $1
       AND DATE(check_in) >= $2
       AND DATE(check_in) <= $3`,
    [employeeId, periodStart, periodEnd]
  );
  const attendedDays = parseFloat(attRes.rows[0].attended_days || 0);
  const totalHours = parseFloat(attRes.rows[0].total_hours || 0);
  const missingCheckouts = parseInt(attRes.rows[0].missing_checkouts || 0, 10);

  // 2. Query approved time off in period
  const leaveRes = await query(
    `SELECT r.duration, t.affects_payroll, t.name AS leave_type
     FROM time_off_requests r
     JOIN time_off_types t ON r.time_off_type_id = t.id
     WHERE r.employee_id = $1
       AND r.status = 'approved'
       AND r.date_from <= $3
       AND r.date_to >= $2`,
    [employeeId, periodStart, periodEnd]
  );

  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;

  for (const l of leaveRes.rows) {
    const dur = parseFloat(l.duration || 0);
    if (l.affects_payroll) {
      unpaidLeaveDays += dur;
    } else {
      paidLeaveDays += dur;
    }
  }

  // Calculate default standard working days in period (approx 22 days per month)
  // Or compute actual working days based on attendances + approved paid leaves
  let workedDays = attendedDays + paidLeaveDays;

  // If employee has no attendance logged for the period (e.g. historical seed or salary slip run)
  // fallback to standard month days (22) minus unpaid leave
  if (attendedDays === 0) {
    workedDays = Math.max(0, 22 - unpaidLeaveDays);
  }

  return {
    attendedDays,
    totalHours,
    missingCheckouts,
    paidLeaveDays,
    unpaidLeaveDays,
    workedDays: Math.min(workedDays, 31) // cap at period length
  };
}

/**
 * Computes a single employee's payslip for a given payrun and structure
 */
async function computeEmployeePayslip(payrunId, employeeId, structureId, periodStart, periodEnd) {
  const warnings = [];

  // 1. Resolve active contract
  const contractRes = await resolveContractForPeriod(employeeId, periodStart, periodEnd);
  if (contractRes.warnings) {
    warnings.push(...contractRes.warnings);
  }

  if (!contractRes.contract) {
    return {
      success: false,
      contractId: null,
      warnings,
      grossAmount: 0,
      netAmount: 0,
      workedDays: 0,
      lines: []
    };
  }

  const contract = contractRes.contract;
  const contractWage = parseFloat(contract.wage);

  // 2. Bank Details Verification
  if (!contract.bank_account_number || !contract.ifsc_code) {
    warnings.push({
      type: 'missing_bank_details',
      message: `Employee ${contract.employee_name} has missing bank account details (account or IFSC is empty).`
    });
  } else if (!contract.bank_verified) {
    warnings.push({
      type: 'unverified_bank',
      message: `Employee ${contract.employee_name} bank account details are pending verification.`
    });
  }

  // 3. Operational Attendance & Leave Integration
  const opData = await calculateOperationalDays(employeeId, periodStart, periodEnd);
  const workedDays = opData.workedDays;

  if (opData.missingCheckouts > 0) {
    warnings.push({
      type: 'other',
      message: `Employee has ${opData.missingCheckouts} uncorrected missing check-out attendance record(s) in this period.`
    });
  }

  // 4. Duplicate payslip check for same employee and period in other payruns
  const dupCheck = await query(
    `SELECT p.id, pr.name AS payrun_name
     FROM payslips p
     JOIN payruns pr ON p.payrun_id = pr.id
     WHERE p.employee_id = $1
       AND p.payrun_id != $2
       AND pr.period_start <= $4
       AND pr.period_end >= $3`,
    [employeeId, payrunId, periodStart, periodEnd]
  );
  if (dupCheck.rows.length > 0) {
    warnings.push({
      type: 'duplicate_payslip',
      message: `Employee already has a payslip in another payrun (${dupCheck.rows[0].payrun_name}) overlapping this period.`
    });
  }

  // 5. Fetch Salary Rules for the chosen structure ordered strictly by sequence
  const rulesRes = await query(
    `SELECT * FROM salary_rules
     WHERE salary_structure_id = $1 AND active = true
     ORDER BY sequence ASC`,
    [structureId]
  );

  const rules = rulesRes.rows;
  const computedScope = {
    WAGE: contractWage,
    WORKED_DAYS: workedDays,
    UNPAID_LEAVES: opData.unpaidLeaveDays
  };

  const computedLines = [];
  let grossAmount = 0;
  let netAmount = 0;

  for (const rule of rules) {
    let amount = 0;

    switch (rule.computation_method) {
      case 'fixed':
        if (rule.amount !== null && rule.amount !== undefined) {
          amount = parseFloat(rule.amount);
        } else if (rule.code === 'BASIC') {
          // If amount is not set on fixed BASIC, use contract wage (or 50% base if allowances present)
          amount = Math.round(contractWage * 0.5);
        } else {
          amount = 0;
        }
        break;

      case 'percentage':
        const baseRuleCode = rule.percentage_of_rule_code;
        const baseValue = computedScope[baseRuleCode] || 0;
        const pct = parseFloat(rule.amount || 0);
        amount = Math.round((baseValue * pct) / 100);
        break;

      case 'formula':
        if (rule.formula) {
          try {
            // Evaluate formula with previously computed rule codes in scope
            const expr = parser.parse(rule.formula);
            amount = Math.round(expr.evaluate(computedScope));
          } catch (err) {
            console.error(`Formula evaluation error on rule ${rule.code}:`, err.message);
            amount = 0;
            warnings.push({
              type: 'other',
              message: `Error evaluating formula for rule ${rule.name} (${rule.code}): ${err.message}`
            });
          }
        }
        break;

      default:
        amount = 0;
    }

    // Protect against negative numbers where invalid
    amount = Math.max(0, amount);

    // Save into execution scope for later sequenced rules
    computedScope[rule.code] = amount;

    if (rule.category === 'gross') {
      grossAmount = amount;
    } else if (rule.category === 'net') {
      netAmount = amount;
    }

    computedLines.push({
      salary_rule_id: rule.id,
      rule_code: rule.code,
      label: rule.name,
      category: rule.category,
      sequence: rule.sequence,
      amount
    });
  }

  // If Gross or Net wasn't explicitly a formula rule, derive them
  if (grossAmount === 0) {
    grossAmount = computedLines
      .filter(l => l.category === 'basic' || l.category === 'allowance')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }
  if (netAmount === 0) {
    const totalDeductions = computedLines
      .filter(l => l.category === 'deduction')
      .reduce((acc, curr) => acc + curr.amount, 0);
    netAmount = Math.max(0, grossAmount - totalDeductions);
  }

  return {
    success: true,
    contractId: contract.id,
    workedDays,
    grossAmount,
    netAmount,
    warnings,
    lines: computedLines
  };
}

module.exports = {
  calculateOperationalDays,
  computeEmployeePayslip
};
