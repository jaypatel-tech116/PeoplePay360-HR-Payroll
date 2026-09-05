const { query, pool } = require('../config/db');
const { computeEmployeePayslip } = require('../services/salaryEngineService');
const { sendPayrunPayslips } = require('../services/emailService');

/**
 * Step 1 Wizard: Preview eligible employees without persisting anything to DB
 */
exports.previewEligibleEmployees = async (req, res) => {
  try {
    const { salary_structure_id, period_start, period_end } = req.body;

    if (!salary_structure_id || !period_start || !period_end) {
      return res.status(400).json({ error: 'Salary structure, period start, and period end are required.' });
    }

    // Find employees with an active contract covering the period
    const sql = `
      SELECT e.id, e.full_name, e.email, e.employee_type, e.bank_account_number,
             e.ifsc_code, e.bank_verified, d.name AS department_name, j.title AS job_title,
             c.id AS contract_id, c.wage, c.start_date AS contract_start, c.end_date AS contract_end,
             c.salary_structure_id, s.name AS structure_name,
             CASE
               WHEN c.salary_structure_id = $1 THEN true
               ELSE false
             END AS structure_matches,
             CASE
               WHEN e.bank_account_number IS NOT NULL AND e.ifsc_code IS NOT NULL AND e.bank_verified = true THEN true
               ELSE false
             END AS bank_ready
      FROM employees e
      JOIN contracts c ON c.employee_id = e.id AND c.status = 'active'
      JOIN salary_structures s ON c.salary_structure_id = s.id
      JOIN departments d ON e.department_id = d.id
      JOIN job_positions j ON e.job_position_id = j.id
      WHERE e.status = 'active'
        AND c.start_date <= $3::date
        AND (c.end_date IS NULL OR c.end_date >= $2::date)
      ORDER BY structure_matches DESC, e.full_name ASC
    `;

    const result = await query(sql, [salary_structure_id, period_start, period_end]);
    res.json({
      totalEligible: result.rows.length,
      employees: result.rows
    });
  } catch (err) {
    console.error('Error previewing eligible employees:', err);
    res.status(500).json({ error: 'Failed to preview eligible employees.' });
  }
};

/**
 * Step 2 Wizard: Explicitly creates the Payrun and links selected employees
 */
exports.createPayrun = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { name, salary_structure_id, period_start, period_end, employee_ids = [] } = req.body;

    if (!name || !salary_structure_id || !period_start || !period_end) {
      return res.status(400).json({ error: 'Please provide payrun name, salary structure, and period dates.' });
    }

    if (employee_ids.length === 0) {
      return res.status(400).json({ error: 'Please select at least one employee for the payrun.' });
    }

    // Insert payrun
    const prRes = await client.query(
      `INSERT INTO payruns
       (name, salary_structure_id, period_start, period_end, status, created_by, total_gross, total_net)
       VALUES ($1, $2, $3, $4, 'draft', $5, 0.00, 0.00)
       RETURNING *`,
      [name, salary_structure_id, period_start, period_end, req.user.id]
    );
    const newPayrun = prRes.rows[0];

    // Insert selected employees
    for (const empId of employee_ids) {
      await client.query(
        'INSERT INTO payrun_employees (payrun_id, employee_id) VALUES ($1, $2)',
        [newPayrun.id, empId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Payrun created successfully in draft status.',
      payrun: newPayrun,
      selectedCount: employee_ids.length
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating payrun:', err);
    res.status(500).json({ error: 'Failed to create payrun.' });
  } finally {
    client.release();
  }
};

exports.getPayruns = async (req, res) => {
  try {
    const { status } = req.query;
    let where = ['1=1'];
    let params = [];

    if (status && status !== 'all') {
      where.push('pr.status = $1');
      params.push(status);
    }

    const sql = `
      SELECT pr.*, s.name AS structure_name, u.name AS created_by_name,
             COUNT(DISTINCT pe.employee_id) AS employee_count,
             COUNT(DISTINCT p.id) AS payslip_count,
             COUNT(DISTINCT pw.id) AS total_warnings_count
      FROM payruns pr
      JOIN salary_structures s ON pr.salary_structure_id = s.id
      JOIN users u ON pr.created_by = u.id
      LEFT JOIN payrun_employees pe ON pe.payrun_id = pr.id
      LEFT JOIN payslips p ON p.payrun_id = pr.id
      LEFT JOIN payslip_warnings pw ON pw.payslip_id = p.id
      WHERE ${where.join(' AND ')}
      GROUP BY pr.id, s.name, u.name
      ORDER BY pr.period_start DESC
    `;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching payruns:', err);
    res.status(500).json({ error: 'Failed to fetch payruns.' });
  }
};

exports.getPayrunById = async (req, res) => {
  try {
    const { id } = req.params;
    const prRes = await query(
      `SELECT pr.*, s.name AS structure_name, u.name AS created_by_name
       FROM payruns pr
       JOIN salary_structures s ON pr.salary_structure_id = s.id
       JOIN users u ON pr.created_by = u.id
       WHERE pr.id = $1`,
      [id]
    );

    if (prRes.rows.length === 0) {
      return res.status(404).json({ error: 'Payrun not found.' });
    }

    const payrun = prRes.rows[0];

    // Fetch payslips in this payrun
    const slipsRes = await query(
      `SELECT p.*, e.full_name AS employee_name, e.email AS employee_email,
              e.employee_type, e.bank_account_number, e.ifsc_code, e.bank_verified,
              d.name AS department_name, j.title AS job_title,
              c.wage AS contract_wage,
              COUNT(pw.id) AS warnings_count
       FROM payslips p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN contracts c ON p.contract_id = c.id
       JOIN departments d ON e.department_id = d.id
       JOIN job_positions j ON e.job_position_id = j.id
       LEFT JOIN payslip_warnings pw ON pw.payslip_id = p.id
       WHERE p.payrun_id = $1
       GROUP BY p.id, e.id, d.name, j.title, c.wage
       ORDER BY e.full_name ASC`,
      [id]
    );

    // Fetch all warnings for this payrun
    const warningsRes = await query(
      `SELECT pw.*, p.employee_id, e.full_name AS employee_name
       FROM payslip_warnings pw
       JOIN payslips p ON pw.payslip_id = p.id
       JOIN employees e ON p.employee_id = e.id
       WHERE p.payrun_id = $1
       ORDER BY pw.created_at ASC`,
      [id]
    );

    payrun.payslips = slipsRes.rows;
    payrun.warnings = warningsRes.rows;

    res.json(payrun);
  } catch (err) {
    console.error('Error fetching payrun detail:', err);
    res.status(500).json({ error: 'Failed to fetch payrun details.' });
  }
};

/**
 * Computes all payslips for the payrun
 */
exports.computePayrun = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Check payrun status
    const prRes = await client.query('SELECT * FROM payruns WHERE id = $1', [id]);
    if (prRes.rows.length === 0) {
      return res.status(404).json({ error: 'Payrun not found.' });
    }

    const payrun = prRes.rows[0];
    if (payrun.status === 'validated' || payrun.status === 'paid') {
      return res.status(400).json({
        error: `Cannot compute a payrun that is already ${payrun.status}. Historical records are locked.`
      });
    }

    await client.query('BEGIN');

    // Get selected employees
    const empRes = await client.query(
      'SELECT employee_id FROM payrun_employees WHERE payrun_id = $1',
      [id]
    );

    let payrunGross = 0;
    let payrunNet = 0;
    let totalWarnings = 0;

    for (const row of empRes.rows) {
      const empId = row.employee_id;

      // Run computation engine
      const comp = await computeEmployeePayslip(
        id,
        empId,
        payrun.salary_structure_id,
        payrun.period_start,
        payrun.period_end
      );

      // Check if payslip already exists for this payrun & employee
      const existingSlip = await client.query(
        'SELECT id FROM payslips WHERE payrun_id = $1 AND employee_id = $2',
        [id, empId]
      );

      let slipId;
      const hasWarnings = comp.warnings && comp.warnings.length > 0;
      if (hasWarnings) totalWarnings += comp.warnings.length;

      if (existingSlip.rows.length > 0) {
        slipId = existingSlip.rows[0].id;
        // Clean existing lines and warnings
        await client.query('DELETE FROM payslip_lines WHERE payslip_id = $1', [slipId]);
        await client.query('DELETE FROM payslip_warnings WHERE payslip_id = $1', [slipId]);

        await client.query(
          `UPDATE payslips
           SET contract_id = $1,
               worked_days = $2,
               status = 'computed',
               gross_amount = $3,
               net_amount = $4,
               has_warnings = $5,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $6`,
          [comp.contractId, comp.workedDays, comp.grossAmount, comp.netAmount, hasWarnings, slipId]
        );
      } else {
        const insertSlip = await client.query(
          `INSERT INTO payslips
           (payrun_id, employee_id, contract_id, worked_days, status, gross_amount, net_amount, has_warnings)
           VALUES ($1, $2, $3, $4, 'computed', $5, $6, $7)
           RETURNING id`,
          [id, empId, comp.contractId, comp.workedDays, comp.grossAmount, comp.netAmount, hasWarnings]
        );
        slipId = insertSlip.rows[0].id;
      }

      payrunGross += comp.grossAmount;
      payrunNet += comp.netAmount;

      // Insert lines
      for (const line of comp.lines) {
        await client.query(
          `INSERT INTO payslip_lines
           (payslip_id, salary_rule_id, rule_code, label, category, sequence, amount)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [slipId, line.salary_rule_id, line.rule_code, line.label, line.category, line.sequence, line.amount]
        );
      }

      // Insert warnings
      if (comp.warnings && comp.warnings.length > 0) {
        for (const w of comp.warnings) {
          await client.query(
            `INSERT INTO payslip_warnings (payslip_id, type, message)
             VALUES ($1, $2, $3)`,
            [slipId, w.type, w.message]
          );
        }
      }
    }

    // Update payrun header
    await client.query(
      `UPDATE payruns
       SET status = 'computed',
           total_gross = $1,
           total_net = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [payrunGross, payrunNet, id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Payrun successfully computed!',
      totalGross: payrunGross,
      totalNet: payrunNet,
      totalWarnings,
      computedPayslips: empRes.rows.length
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error computing payrun:', err);
    res.status(500).json({ error: 'Failed to compute payrun: ' + err.message });
  } finally {
    client.release();
  }
};

/**
 * Validates a payrun, checking unresolved warnings
 */
exports.validatePayrun = async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.body;

    const prRes = await query('SELECT * FROM payruns WHERE id = $1', [id]);
    if (prRes.rows.length === 0) {
      return res.status(404).json({ error: 'Payrun not found.' });
    }

    const payrun = prRes.rows[0];
    if (payrun.status !== 'computed') {
      return res.status(400).json({ error: `Payrun must be in 'computed' status before validation (current: ${payrun.status}).` });
    }

    // Check unresolved warnings
    const warningsRes = await query(
      `SELECT pw.*, e.full_name AS employee_name
       FROM payslip_warnings pw
       JOIN payslips p ON pw.payslip_id = p.id
       JOIN employees e ON p.employee_id = e.id
       WHERE p.payrun_id = $1`,
      [id]
    );

    const criticalWarnings = warningsRes.rows.filter(w =>
      ['missing_contract', 'missing_bank_details', 'duplicate_payslip'].includes(w.type)
    );

    if (criticalWarnings.length > 0 && !force) {
      return res.status(400).json({
        error: 'Validation blocked: Unresolved critical warnings exist on this payrun.',
        blockingWarnings: criticalWarnings,
        canForce: true
      });
    }

    // Transition status to validated
    await query(
      `UPDATE payruns
       SET status = 'validated', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    await query(
      `UPDATE payslips
       SET status = 'validated', updated_at = CURRENT_TIMESTAMP
       WHERE payrun_id = $1`,
      [id]
    );

    res.json({ message: 'Payrun successfully validated! Ready for payout disbursement.' });
  } catch (err) {
    console.error('Error validating payrun:', err);
    res.status(500).json({ error: 'Failed to validate payrun.' });
  }
};

/**
 * Marks a payrun as Paid and locks historical records
 */
exports.markPaidPayrun = async (req, res) => {
  try {
    const { id } = req.params;

    const prRes = await query('SELECT * FROM payruns WHERE id = $1', [id]);
    if (prRes.rows.length === 0) {
      return res.status(404).json({ error: 'Payrun not found.' });
    }

    const payrun = prRes.rows[0];
    if (payrun.status !== 'validated') {
      return res.status(400).json({ error: `Payrun must be validated before marking as paid (current: ${payrun.status}).` });
    }

    // Update status to paid
    await query(
      `UPDATE payruns
       SET status = 'paid', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    await query(
      `UPDATE payslips
       SET status = 'paid', updated_at = CURRENT_TIMESTAMP
       WHERE payrun_id = $1`,
      [id]
    );

    res.json({ message: 'Payrun marked as Paid. Records are locked for historical compliance.' });
  } catch (err) {
    console.error('Error marking payrun as paid:', err);
    res.status(500).json({ error: 'Failed to mark payrun as paid.' });
  }
};

/**
 * Bulk email payslips with attached PDF
 */
exports.sendPayslips = async (req, res) => {
  try {
    const { id } = req.params;

    const prRes = await query('SELECT * FROM payruns WHERE id = $1', [id]);
    if (prRes.rows.length === 0) {
      return res.status(404).json({ error: 'Payrun not found.' });
    }

    const payrun = prRes.rows[0];
    if (payrun.status !== 'validated' && payrun.status !== 'paid') {
      return res.status(400).json({ error: 'Payslips can only be emailed after payrun is validated or paid.' });
    }

    const dispatchResults = await sendPayrunPayslips(id);

    const successCount = dispatchResults.filter(r => r.success).length;
    res.json({
      message: `Bulk payslip dispatch completed: ${successCount} of ${dispatchResults.length} delivered.`,
      results: dispatchResults
    });
  } catch (err) {
    console.error('Error sending payslips:', err);
    res.status(500).json({ error: 'Failed to send payslips: ' + err.message });
  }
};

exports.deletePayrun = async (req, res) => {
  try {
    const { id } = req.params;
    const prRes = await query('SELECT status FROM payruns WHERE id = $1', [id]);
    if (prRes.rows.length === 0) {
      return res.status(404).json({ error: 'Payrun not found.' });
    }

    if (prRes.rows[0].status === 'paid') {
      return res.status(400).json({ error: 'Cannot delete a paid payrun due to historical audit rules.' });
    }

    await query('DELETE FROM payruns WHERE id = $1', [id]);
    res.json({ message: 'Payrun deleted successfully.' });
  } catch (err) {
    console.error('Error deleting payrun:', err);
    res.status(500).json({ error: 'Failed to delete payrun.' });
  }
};
