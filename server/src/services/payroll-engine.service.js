const { pool } = require("../config/mysqlDb");

/**
 * Executes payroll calculation engine for a payrun
 * Computes earnings, deductions, net salary, and itemized lines for all active employees
 * @param {number} payrunId
 */
const computePayrun = async (payrunId) => {
  // 1. Fetch payrun
  const [payruns] = await pool.query(`SELECT * FROM payruns WHERE id = ?;`, [payrunId]);
  const payrun = payruns[0];
  if (!payrun) throw new Error("Payrun not found.");

  // 2. Fetch all active contracts with employee details
  const [contracts] = await pool.query(`
    SELECT 
      c.*,
      e.employee_code,
      e.first_name,
      e.last_name,
      e.designation
    FROM contracts c
    JOIN employees e ON c.employee_id = e.id
    WHERE c.status = 'ACTIVE' AND e.status = 'ACTIVE';
  `);

  if (contracts.length === 0) {
    throw new Error("No active employee contracts found to process.");
  }

  // 3. Fetch all salary rules
  const [allRules] = await pool.query(`SELECT * FROM salary_rules WHERE is_active = true ORDER BY sequence ASC;`);

  // Clear existing payslips for this payrun to recalculate freshly
  await pool.query(`DELETE FROM payslips WHERE payrun_id = ?;`, [payrunId]);

  let payrunGross = 0;
  let payrunDeductions = 0;
  let payrunNet = 0;

  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const pDate = new Date(payrun.period_end);
  const periodCode = `${monthNames[pDate.getMonth()]}${String(pDate.getFullYear()).slice(-2)}`;

  for (const contract of contracts) {
    const wage = parseFloat(contract.wage) || 50000;
    const structureId = contract.salary_structure_id || payrun.salary_structure_id || 1;

    // Filter rules matching structure or default
    let rules = allRules.filter((r) => r.salary_structure_id === structureId);
    if (rules.length === 0) {
      rules = allRules.filter((r) => r.salary_structure_id === 1);
    }

    let basic = 0;
    let hra = 0;
    let allowances = 0;
    let pf = 0;
    let pt = 200;
    let tds = 0;

    const lineItems = [];

    for (const rule of rules) {
      let amount = 0;

      if (rule.calculation_type === "PERCENTAGE") {
        const rate = parseFloat(rule.percentage) || 0;
        if (rule.code === "PF" && basic > 0) {
          amount = (basic * rate) / 100;
        } else if (rule.code === "HRA" && basic > 0) {
          amount = (basic * rate) / 100;
        } else {
          amount = (wage * rate) / 100;
        }
      } else {
        amount = parseFloat(rule.fixed_amount) || 0;
      }

      amount = parseFloat(amount.toFixed(2));

      if (rule.code === "BASIC") basic = amount;
      else if (rule.code === "HRA") hra = amount;
      else if (rule.code === "PF") pf = amount;
      else if (rule.code === "PT") pt = amount;
      else if (rule.code === "TDS") tds = amount;
      else if (rule.category === "ALLOWANCE") allowances += amount;

      lineItems.push({
        rule_id: rule.id,
        rule_code: rule.code,
        rule_name: rule.name,
        category: rule.category,
        rate: rule.percentage || 100,
        amount,
        sequence: rule.sequence || 10,
      });
    }

    if (basic === 0) basic = wage * 0.5;
    if (hra === 0) hra = basic * 0.4;
    if (pf === 0) pf = basic * 0.12;

    const grossSalary = parseFloat((basic + hra + allowances).toFixed(2));
    const totalDeductions = parseFloat((pf + pt + tds).toFixed(2));
    const netSalary = parseFloat((grossSalary - totalDeductions).toFixed(2));

    const payslipNumber = `PS-${periodCode}-${contract.employee_code}`;

    // Insert payslip
    const [psResult] = await pool.query(`
      INSERT INTO payslips (
        payslip_number, payrun_id, employee_id, contract_id, salary_structure_id,
        period_start, period_end, worked_days, paid_days,
        gross_amount, deduction_amount, net_amount, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 26.00, 26.00, ?, ?, ?, 'Computed', 'UNPAID');
    `, [
      payslipNumber,
      payrunId,
      contract.employee_id,
      contract.id,
      structureId,
      payrun.period_start,
      payrun.period_end,
      grossSalary,
      totalDeductions,
      netSalary,
    ]);

    const payslipId = psResult.insertId;

    // Insert payslip lines
    for (const item of lineItems) {
      await pool.query(`
        INSERT INTO payslip_lines (
          payslip_id, rule_id, rule_code, rule_name, category, sequence, quantity, rate, amount
        ) VALUES (?, ?, ?, ?, ?, ?, 1.0, ?, ?);
      `, [
        payslipId,
        item.rule_id,
        item.rule_code,
        item.rule_name,
        item.category,
        item.sequence,
        item.rate,
        item.amount,
      ]);
    }

    // Net Summary Line
    await pool.query(`
      INSERT INTO payslip_lines (
        payslip_id, rule_id, rule_code, rule_name, category, sequence, quantity, rate, amount
      ) VALUES (?, NULL, 'NET', 'Net Payable Salary', 'NET', 99, 1.0, 100.0, ?);
    `, [payslipId, netSalary]);

    payrunGross += grossSalary;
    payrunDeductions += totalDeductions;
    payrunNet += netSalary;
  }

  // Update payrun totals and status
  await pool.query(`
    UPDATE payruns 
    SET 
      employee_count = ?,
      total_gross = ?,
      total_deductions = ?,
      total_net = ?,
      status = 'Computed',
      computed_at = NOW()
    WHERE id = ?;
  `, [
    contracts.length,
    parseFloat(payrunGross.toFixed(2)),
    parseFloat(payrunDeductions.toFixed(2)),
    parseFloat(payrunNet.toFixed(2)),
    payrunId,
  ]);

  // Log in audit_logs
  await pool.query(`
    INSERT INTO audit_logs (entity_type, entity_id, action, new_data)
    VALUES ('PAYRUN', ?, 'COMPUTED', ?);
  `, [payrunId, JSON.stringify({ employees: contracts.length, net: payrunNet })]);

  return getPayrunById(payrunId);
};

/**
 * Validate and finalize a payrun
 */
const validatePayrun = async (payrunId) => {
  await pool.query(`UPDATE payruns SET status = 'Validated', validated_at = NOW() WHERE id = ?;`, [payrunId]);
  await pool.query(`UPDATE payslips SET status = 'Validated' WHERE payrun_id = ?;`, [payrunId]);

  await pool.query(`
    INSERT INTO audit_logs (entity_type, entity_id, action, new_data)
    VALUES ('PAYRUN', ?, 'VALIDATED', JSON_OBJECT('status', 'Validated'));
  `, [payrunId]);

  return getPayrunById(payrunId);
};

/**
 * Mark payrun as paid
 */
const markPayrunPaid = async (payrunId) => {
  await pool.query(`UPDATE payruns SET status = 'Completed', paid_at = NOW() WHERE id = ?;`, [payrunId]);
  await pool.query(`UPDATE payslips SET status = 'Paid', payment_status = 'PAID' WHERE payrun_id = ?;`, [payrunId]);

  await pool.query(`
    INSERT INTO audit_logs (entity_type, entity_id, action, new_data)
    VALUES ('PAYRUN', ?, 'PAID', JSON_OBJECT('status', 'Completed'));
  `, [payrunId]);

  return getPayrunById(payrunId);
};

/**
 * Fetch detailed payrun with all payslips
 */
const getPayrunById = async (id) => {
  const [payruns] = await pool.query(`SELECT * FROM payruns WHERE id = ?;`, [id]);
  const payrun = payruns[0];
  if (!payrun) return null;

  const [slips] = await pool.query(`
    SELECT 
      p.*,
      e.employee_code,
      CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
      e.designation,
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
  computePayrun,
  validatePayrun,
  markPayrunPaid,
  getPayrunById,
};
