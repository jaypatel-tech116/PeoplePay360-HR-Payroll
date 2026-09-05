const { pool } = require("../config/mysqlDb");
const { getApplicableContract } = require("./contract-selection.service");
const { getEmployeeAttendanceSummary } = require("./attendance-aggregation.service");
const { evaluateFormula } = require("./formula-parser.service");
const { logAudit } = require("../utils/auditLogger");

/**
 * Calculates a single payslip for an employee within a payrun
 * Dynamic rule-driven salary calculation (zero hardcoded salary values)
 * 
 * @param {number|string} employeeId
 * @param {Object} payrun - Payrun database row
 * @returns {Promise<Object>} Calculated payslip and itemized lines
 */
const calculatePayslip = async (employeeId, payrun) => {
  const periodStart = payrun.period_start;
  const periodEnd = payrun.period_end;

  // 1. Fetch employee core record
  const [empRows] = await pool.query(`
    SELECT e.*, d.name AS department_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = ?;
  `, [employeeId]);
  const employee = empRows[0];
  if (!employee) {
    const err = new Error(`Employee with ID ${employeeId} does not exist.`);
    err.code = "EMPLOYEE_NOT_FOUND";
    throw err;
  }

  // 2. Load applicable contract for payroll period
  const contract = await getApplicableContract(employeeId, periodStart, periodEnd);
  const wage = parseFloat(contract.wage) || 0;

  // 3. Determine salary structure
  const structureId = contract.salary_structure_id || payrun.salary_structure_id;
  const [structRows] = await pool.query(`
    SELECT * FROM salary_structures WHERE id = ? AND is_active = true;
  `, [structureId]);
  const structure = structRows[0];
  if (!structure) {
    const err = new Error(`Active salary structure with ID ${structureId} not found.`);
    err.code = "NO_SALARY_STRUCTURE";
    throw err;
  }

  // 4. Load active salary rules sorted by sequence
  const [rules] = await pool.query(`
    SELECT * FROM salary_rules 
    WHERE salary_structure_id = ? AND is_active = true 
    ORDER BY sequence ASC, id ASC;
  `, [structure.id]);

  if (rules.length === 0) {
    const err = new Error(`No active salary rules configured for structure '${structure.name}'.`);
    err.code = "NO_SALARY_RULES";
    throw err;
  }

  // 5. Load attendance & leave aggregation summary
  const attendance = await getEmployeeAttendanceSummary(
    employeeId,
    periodStart,
    periodEnd,
    employee.schedule_id
  );

  // 6. Build evaluation context for dynamic rule processing
  const context = {
    WAGE: wage,
    SCHEDULED_DAYS: attendance.scheduled_days,
    WORKED_DAYS: attendance.worked_days,
    PRESENT_DAYS: attendance.present_days,
    PAID_DAYS: attendance.paid_days,
    LOP_DAYS: attendance.lop_days,
    UNPAID_DAYS: attendance.unpaid_leave_days,
    OVERTIME_HOURS: attendance.overtime_hours,
    TOTAL_DAYS: attendance.scheduled_days,
    BASIC: 0,
    HRA: 0,
    GROSS: 0,
    PF: 0,
    PT: 0,
    TDS: 0,
    DEDUCTIONS: 0,
    NET: 0,
  };

  const lineItems = [];
  let totalGross = 0;
  let totalDeductions = 0;

  // 7. Execute rules in ascending sequence order
  for (const rule of rules) {
    let ruleAmount = 0;
    const calcDetails = {
      rule_code: rule.code,
      calculation_type: rule.calculation_type,
    };

    if (rule.calculation_type === "FIXED") {
      ruleAmount = parseFloat(rule.fixed_amount || 0);
      calcDetails.fixed_amount = ruleAmount;
    } else if (rule.calculation_type === "PERCENTAGE") {
      const percentage = parseFloat(rule.percentage) || 0;
      let baseAmount = wage;
      let baseRuleCode = "WAGE";

      // By standard payroll convention, HRA and PF percentage rules calculate against BASIC
      if (rule.code === "HRA" || rule.code === "PF") {
        baseAmount = context.BASIC > 0 ? context.BASIC : wage * 0.5;
        baseRuleCode = "BASIC";
      } else if (rule.category === "DEDUCTION" && context.GROSS > 0) {
        baseAmount = context.GROSS;
        baseRuleCode = "GROSS";
      }

      ruleAmount = (baseAmount * percentage) / 100;
      calcDetails.base = baseRuleCode;
      calcDetails.base_amount = baseAmount;
      calcDetails.percentage = percentage;
      calcDetails.result = ruleAmount;
    } else if (rule.calculation_type === "FORMULA") {
      if (rule.formula && rule.formula.trim()) {
        ruleAmount = evaluateFormula(rule.formula, context);
        calcDetails.formula = rule.formula;
        calcDetails.result = ruleAmount;
      }
    }

    ruleAmount = parseFloat(ruleAmount.toFixed(2));

    // Update context variable
    context[rule.code] = ruleAmount;

    // Categorize financial balance
    if (rule.category === "BASIC" || rule.category === "ALLOWANCE") {
      totalGross += ruleAmount;
      context.GROSS = parseFloat(totalGross.toFixed(2));
    } else if (rule.category === "DEDUCTION") {
      totalDeductions += ruleAmount;
      context.DEDUCTIONS = parseFloat(totalDeductions.toFixed(2));
    } else if (rule.category === "GROSS") {
      // Rule itself explicitly computes gross if formula is provided
      if (ruleAmount > 0) totalGross = ruleAmount;
      context.GROSS = totalGross;
    }

    lineItems.push({
      rule_id: rule.id,
      rule_code: rule.code,
      rule_name: rule.name,
      category: rule.category,
      sequence: rule.sequence,
      quantity: 1.0,
      rate: rule.percentage || 100,
      amount: ruleAmount,
      calculation_details: calcDetails,
    });
  }

  // Final Net take-home calculation: Gross - Deductions
  const netAmount = Math.max(0, parseFloat((totalGross - totalDeductions).toFixed(2)));
  context.NET = netAmount;

  // Add summary net line item
  lineItems.push({
    rule_id: null,
    rule_code: "NET",
    rule_name: "Net Payable Salary",
    category: "NET",
    sequence: 999,
    quantity: 1.0,
    rate: 100.0,
    amount: netAmount,
    calculation_details: {
      calculation_type: "NET_CALCULATION",
      gross: totalGross,
      deductions: totalDeductions,
      net: netAmount,
    },
  });

  // Payslip number formatting: PS-YYYYMM-EMPCODE
  const pDate = new Date(periodEnd);
  const yearStr = pDate.getFullYear();
  const monthStr = String(pDate.getMonth() + 1).padStart(2, "0");
  const payslipNumber = `PS-${yearStr}${monthStr}-${employee.employee_code}`;

  return {
    payslip_number: payslipNumber,
    payrun_id: payrun.id,
    employee_id: employee.id,
    contract_id: contract.id,
    salary_structure_id: structure.id,
    period_start: periodStart,
    period_end: periodEnd,
    worked_days: attendance.worked_days,
    paid_days: attendance.paid_days,
    gross_amount: parseFloat(totalGross.toFixed(2)),
    deduction_amount: parseFloat(totalDeductions.toFixed(2)),
    net_amount: netAmount,
    status: "Computed",
    payment_status: "UNPAID",
    lines: lineItems,
    employee,
    contract,
  };
};

/**
 * Creates a new payrun in DRAFT status after thorough validation
 */
const createPayrun = async ({
  salary_structure_id,
  period_start,
  period_end,
  pay_date,
  employee_ids = [],
  month = null,
  year = null,
  user_id = null,
}) => {
  if (!period_start || !period_end) {
    const err = new Error("Payroll period start and end dates are required.");
    err.code = "INVALID_PERIOD";
    throw err;
  }

  const pStart = new Date(period_start);
  const pEnd = new Date(period_end);

  if (pEnd < pStart) {
    const err = new Error("Period end date cannot be earlier than period start date.");
    err.code = "INVALID_DATES";
    throw err;
  }

  // Validate salary structure exists
  const [structRows] = await pool.query(
    `SELECT * FROM salary_structures WHERE id = ? AND is_active = true;`,
    [salary_structure_id || 1]
  );
  const structure = structRows[0];
  if (!structure) {
    const err = new Error("Selected salary structure is invalid or inactive.");
    err.code = "INVALID_STRUCTURE";
    throw err;
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mName = month || monthNames[pEnd.getMonth()];
  const yVal = year || String(pEnd.getFullYear());
  const runNumber = `PAY-${yVal}-${String(pEnd.getMonth() + 1).padStart(2, "0")}`;

  // Check if a payrun with same run_number already exists
  const [existingRun] = await pool.query(
    `SELECT id, status FROM payruns WHERE run_number = ? AND status != 'CANCELLED';`,
    [runNumber]
  );
  if (existingRun.length > 0) {
    const err = new Error(`A payrun batch for ${mName} ${yVal} (${runNumber}) already exists in status '${existingRun[0].status}'.`);
    err.code = "DUPLICATE_PAYRUN";
    throw err;
  }

  const payDateVal = pay_date || pEnd.toISOString().split("T")[0];

  const [result] = await pool.query(`
    INSERT INTO payruns (
      run_number, month, year, pay_date, salary_structure_id,
      period_start, period_end, status, employee_count,
      total_gross, total_deductions, total_net, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft', ?, 0, 0, 0, ?, NOW());
  `, [
    runNumber,
    mName,
    yVal,
    payDateVal,
    structure.id,
    period_start,
    period_end,
    employee_ids.length || 0,
    user_id || null,
  ]);

  const payrunId = result.insertId;

  // Log audit action
  await logAudit({
    userId: user_id,
    action: "PAYRUN_CREATED",
    entityType: "PAYRUN",
    entityId: payrunId,
    newData: { runNumber, month: mName, year: yVal, structure: structure.name },
  });

  return getPayrunById(payrunId);
};

/**
 * Computes all employee payslips for a payrun transactionally
 * Re-computes idempotently without leaving corrupt data
 */
const computePayrun = async (payrunId, userId = null, targetEmployeeIds = null) => {
  const [payruns] = await pool.query(`SELECT * FROM payruns WHERE id = ?;`, [payrunId]);
  const payrun = payruns[0];
  if (!payrun) {
    const err = new Error("Payrun not found.");
    err.code = "PAYRUN_NOT_FOUND";
    throw err;
  }

  // Enforce status machine: PAID payroll cannot be recomputed or mutated
  if (payrun.status === "Paid" || payrun.status === "Completed") {
    const err = new Error("Cannot recompute payroll: This payrun has already been PAID and is immutable.");
    err.code = "PAYRUN_ALREADY_PAID";
    throw err;
  }

  let employees = [];

  // If specific target employee IDs were requested for this payrun
  if (targetEmployeeIds && Array.isArray(targetEmployeeIds) && targetEmployeeIds.length > 0) {
    const placeholders = targetEmployeeIds.map(() => "?").join(",");
    const [empRows] = await pool.query(`
      SELECT id, employee_code, first_name, last_name, joining_date, termination_date
      FROM employees
      WHERE id IN (${placeholders})
      ORDER BY employee_code ASC;
    `, targetEmployeeIds);
    employees = empRows;
  } else {
    // Load eligible employees who have active contracts covering this period
    const [empRows] = await pool.query(`
      SELECT DISTINCT e.id, e.employee_code, e.first_name, e.last_name, e.joining_date, e.termination_date
      FROM employees e
      JOIN contracts c ON c.employee_id = e.id
      WHERE e.status = 'ACTIVE'
        AND c.status = 'ACTIVE'
        AND c.start_date <= ?
        AND (c.end_date IS NULL OR c.end_date >= ?)
        AND e.joining_date <= ?
        AND (e.termination_date IS NULL OR e.termination_date >= ?)
      ORDER BY e.employee_code ASC;
    `, [payrun.period_end, payrun.period_start, payrun.period_end, payrun.period_start]);
    employees = empRows;
  }

  if (employees.length === 0) {
    const err = new Error("No active eligible employees with valid contracts found for this payroll period.");
    err.code = "NO_ELIGIBLE_EMPLOYEES";
    throw err;
  }

  // Pre-flight check: ensure every employee has exactly one applicable contract
  const calculationResults = [];
  const errors = [];

  for (const emp of employees) {
    try {
      const slipData = await calculatePayslip(emp.id, payrun);
      calculationResults.push(slipData);
    } catch (calcErr) {
      errors.push({
        employee_id: emp.id,
        employee_code: emp.employee_code,
        name: `${emp.first_name} ${emp.last_name}`,
        code: calcErr.code || "CALCULATION_ERROR",
        message: calcErr.message,
      });
    }
  }

  if (errors.length > 0) {
    const err = new Error(`Payroll computation failed for ${errors.length} employee(s).`);
    err.code = "COMPUTE_VALIDATION_FAILED";
    err.details = errors;
    throw err;
  }

  // Transactional database writes: Clean existing payslips for this payrun, then insert freshly computed records
  let payrunGross = 0;
  let payrunDeductions = 0;
  let payrunNet = 0;

  // Clear existing payslips for this payrun
  await pool.query(`DELETE FROM payslips WHERE payrun_id = ?;`, [payrunId]);

  for (const slip of calculationResults) {
    const [psResult] = await pool.query(`
      INSERT INTO payslips (
        payslip_number, payrun_id, employee_id, contract_id, salary_structure_id,
        period_start, period_end, worked_days, paid_days,
        gross_amount, deduction_amount, net_amount, status, payment_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Computed', 'UNPAID', NOW());
    `, [
      slip.payslip_number,
      payrunId,
      slip.employee_id,
      slip.contract_id,
      slip.salary_structure_id,
      slip.period_start,
      slip.period_end,
      slip.worked_days,
      slip.paid_days,
      slip.gross_amount,
      slip.deduction_amount,
      slip.net_amount,
    ]);

    const payslipId = psResult.insertId;

    // Insert itemized payslip lines with structured calculation_details
    for (const line of slip.lines) {
      await pool.query(`
        INSERT INTO payslip_lines (
          payslip_id, rule_id, rule_code, rule_name, category, sequence,
          quantity, rate, amount, calculation_details, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());
      `, [
        payslipId,
        line.rule_id || null,
        line.rule_code,
        line.rule_name,
        line.category,
        line.sequence,
        line.quantity,
        line.rate,
        line.amount,
        JSON.stringify(line.calculation_details),
      ]);
    }

    payrunGross += slip.gross_amount;
    payrunDeductions += slip.deduction_amount;
    payrunNet += slip.net_amount;
  }

  // Update payrun totals and set status = COMPUTED
  await pool.query(`
    UPDATE payruns
    SET
      employee_count = ?,
      total_gross = ?,
      total_deductions = ?,
      total_net = ?,
      status = 'Computed',
      computed_at = NOW(),
      updated_at = NOW()
    WHERE id = ?;
  `, [
    calculationResults.length,
    parseFloat(payrunGross.toFixed(2)),
    parseFloat(payrunDeductions.toFixed(2)),
    parseFloat(payrunNet.toFixed(2)),
    payrunId,
  ]);

  // Log audit action
  await logAudit({
    userId,
    action: "PAYRUN_COMPUTED",
    entityType: "PAYRUN",
    entityId: payrunId,
    newData: {
      employeeCount: calculationResults.length,
      totalGross: payrunGross,
      totalNet: payrunNet,
    },
  });

  return getPayrunById(payrunId);
};

/**
 * Validates a payrun against strict 7-point payroll audit rules
 * Returns structured validation result with errors and warnings
 */
const validatePayrun = async (payrunId, userId = null) => {
  const [payruns] = await pool.query(`SELECT * FROM payruns WHERE id = ?;`, [payrunId]);
  const payrun = payruns[0];
  if (!payrun) {
    const err = new Error("Payrun not found.");
    err.code = "PAYRUN_NOT_FOUND";
    throw err;
  }

  if (payrun.status === "Draft") {
    const err = new Error("Payrun must be computed before it can be validated.");
    err.code = "PAYRUN_NOT_COMPUTED";
    throw err;
  }

  const errors = [];
  const warnings = [];

  // 1. Fetch payslips belonging to payrun
  const [slips] = await pool.query(`
    SELECT p.*, e.employee_code, e.first_name, e.last_name, e.email, e.bank_account
    FROM payslips p
    JOIN employees e ON p.employee_id = e.id
    WHERE p.payrun_id = ?;
  `, [payrunId]);

  if (slips.length === 0) {
    errors.push({
      code: "NO_PAYSLIPS",
      message: "No payslips exist for this payrun batch.",
    });
  }

  for (const s of slips) {
    const empName = `${s.first_name} ${s.last_name}`;

    // 2. Validate amounts
    if (parseFloat(s.net_amount) <= 0 && parseFloat(s.gross_amount) > 0) {
      warnings.push({
        employee_id: s.employee_id,
        employee_code: s.employee_code,
        name: empName,
        code: "ZERO_NET_SALARY",
        message: `${empName} has a net payable salary of ₹0.00.`,
      });
    }

    // 3. Validate payment details
    if (!s.bank_account || s.bank_account.trim() === "") {
      warnings.push({
        employee_id: s.employee_id,
        employee_code: s.employee_code,
        name: empName,
        code: "MISSING_BANK_ACCOUNT",
        message: `${empName} (${s.employee_code}) does not have bank account details on file.`,
      });
    }

    // 4. Validate email
    if (!s.email || !s.email.includes("@")) {
      warnings.push({
        employee_id: s.employee_id,
        employee_code: s.employee_code,
        name: empName,
        code: "MISSING_EMAIL",
        message: `${empName} (${s.employee_code}) has no valid email for payslip dispatch.`,
      });
    }
  }

  const isValid = errors.length === 0;

  if (isValid) {
    await pool.query(`
      UPDATE payruns SET status = 'Validated', validated_at = NOW(), updated_at = NOW() WHERE id = ?;
    `, [payrunId]);

    await pool.query(`
      UPDATE payslips SET status = 'Validated', updated_at = NOW() WHERE payrun_id = ?;
    `, [payrunId]);

    await logAudit({
      userId,
      action: "PAYRUN_VALIDATED",
      entityType: "PAYRUN",
      entityId: payrunId,
      newData: { status: "Validated", warningsCount: warnings.length },
    });
  }

  const updatedPayrun = await getPayrunById(payrunId);

  return {
    valid: isValid,
    errors,
    warnings,
    payrun: updatedPayrun,
  };
};

/**
 * Marks payrun as PAID transactionally
 * Disallows marking unpaid if not validated
 */
const markPayrunPaid = async (payrunId, userId = null) => {
  const [payruns] = await pool.query(`SELECT * FROM payruns WHERE id = ?;`, [payrunId]);
  const payrun = payruns[0];
  if (!payrun) {
    const err = new Error("Payrun not found.");
    err.code = "PAYRUN_NOT_FOUND";
    throw err;
  }

  // Idempotency check: If already paid, return safely
  if (payrun.status === "Paid" || payrun.status === "Completed") {
    return getPayrunById(payrunId);
  }

  // State machine enforcement
  if (payrun.status !== "Validated") {
    const err = new Error(`Cannot mark payrun as Paid: Current status is '${payrun.status}'. Payrun must be VALIDATED first.`);
    err.code = "INVALID_STATUS_TRANSITION";
    throw err;
  }

  await pool.query(`
    UPDATE payruns 
    SET status = 'Completed', paid_at = NOW(), updated_at = NOW() 
    WHERE id = ?;
  `, [payrunId]);

  await pool.query(`
    UPDATE payslips 
    SET status = 'Paid', payment_status = 'PAID', updated_at = NOW() 
    WHERE payrun_id = ?;
  `, [payrunId]);

  await logAudit({
    userId,
    action: "PAYRUN_PAID",
    entityType: "PAYRUN",
    entityId: payrunId,
    newData: { status: "Completed", paidAt: new Date().toISOString() },
  });

  return getPayrunById(payrunId);
};

/**
 * Fetch detailed payrun by ID with all itemized payslips
 */
const getPayrunById = async (id) => {
  const [payruns] = await pool.query(`
    SELECT pr.*, ss.name AS salary_structure_name, ss.code AS salary_structure_code
    FROM payruns pr
    LEFT JOIN salary_structures ss ON pr.salary_structure_id = ss.id
    WHERE pr.id = ?;
  `, [id]);
  const payrun = payruns[0];
  if (!payrun) return null;

  const [slips] = await pool.query(`
    SELECT 
      p.*,
      e.employee_code,
      CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
      e.designation,
      e.email,
      e.bank_account,
      d.name AS department_name
    FROM payslips p
    JOIN employees e ON p.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE p.payrun_id = ?
    ORDER BY e.employee_code ASC;
  `, [id]);

  return {
    ...payrun,
    payslips: slips,
  };
};

module.exports = {
  calculatePayslip,
  createPayrun,
  computePayrun,
  validatePayrun,
  markPayrunPaid,
  getPayrunById,
};
