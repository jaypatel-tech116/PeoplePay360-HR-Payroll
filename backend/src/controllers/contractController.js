const { query } = require('../config/db');

exports.getContracts = async (req, res) => {
  try {
    const { employee_id, status } = req.query;

    let where = ['1=1'];
    let params = [];
    let pIdx = 1;

    if (employee_id) {
      where.push(`c.employee_id = $${pIdx}`);
      params.push(employee_id);
      pIdx++;
    }

    if (status && status !== 'all') {
      where.push(`c.status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    const sql = `
      SELECT c.*, e.full_name AS employee_name, e.email AS employee_email,
             d.name AS department_name, j.title AS job_title,
             s.name AS structure_name, ws.name AS schedule_name
      FROM contracts c
      JOIN employees e ON c.employee_id = e.id
      JOIN departments d ON c.department_id = d.id
      JOIN job_positions j ON c.job_position_id = j.id
      JOIN salary_structures s ON c.salary_structure_id = s.id
      JOIN working_schedules ws ON c.working_schedule_id = ws.id
      WHERE ${where.join(' AND ')}
      ORDER BY c.employee_id ASC, c.start_date DESC
    `;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contracts:', err);
    res.status(500).json({ error: 'Failed to fetch contracts.' });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT c.*, e.full_name AS employee_name,
              d.name AS department_name, j.title AS job_title,
              s.name AS structure_name, ws.name AS schedule_name
       FROM contracts c
       JOIN employees e ON c.employee_id = e.id
       JOIN departments d ON c.department_id = d.id
       JOIN job_positions j ON c.job_position_id = j.id
       JOIN salary_structures s ON c.salary_structure_id = s.id
       JOIN working_schedules ws ON c.working_schedule_id = ws.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching contract detail:', err);
    res.status(500).json({ error: 'Failed to fetch contract detail.' });
  }
};

exports.createContract = async (req, res) => {
  try {
    const {
      employee_id, department_id, job_position_id, wage,
      salary_structure_id, working_schedule_id, start_date,
      end_date, status = 'draft'
    } = req.body;

    if (!employee_id || !department_id || !job_position_id || !wage || !salary_structure_id || !working_schedule_id || !start_date) {
      return res.status(400).json({ error: 'Please provide all required contract parameters.' });
    }

    // Overlap Guard: prevent two active contracts with overlapping dates
    if (status === 'active') {
      const overlapCheck = await query(
        `SELECT id, start_date, end_date FROM contracts
         WHERE employee_id = $1
           AND status = 'active'
           AND start_date <= COALESCE($3::date, '9999-12-31'::date)
           AND COALESCE(end_date, '9999-12-31'::date) >= $2::date`,
        [employee_id, start_date, end_date || null]
      );

      if (overlapCheck.rows.length > 0) {
        return res.status(400).json({
          error: `Overlapping active contract detected! Employee already has active contract #${overlapCheck.rows[0].id} covering this date window.`
        });
      }
    }

    const result = await query(
      `INSERT INTO contracts
       (employee_id, department_id, job_position_id, wage, salary_structure_id, working_schedule_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [employee_id, department_id, job_position_id, wage, salary_structure_id, working_schedule_id, start_date, end_date || null, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating contract:', err);
    res.status(500).json({ error: 'Failed to create contract.' });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      department_id, job_position_id, wage,
      salary_structure_id, working_schedule_id, start_date,
      end_date, status
    } = req.body;

    // Fetch existing
    const existingRes = await query('SELECT * FROM contracts WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    const existing = existingRes.rows[0];

    const targetStatus = status || existing.status;
    const targetStart = start_date || existing.start_date;
    const targetEnd = end_date !== undefined ? end_date : existing.end_date;

    // Overlap Guard on update
    if (targetStatus === 'active') {
      const overlapCheck = await query(
        `SELECT id, start_date, end_date FROM contracts
         WHERE employee_id = $1
           AND id != $2
           AND status = 'active'
           AND start_date <= COALESCE($4::date, '9999-12-31'::date)
           AND COALESCE(end_date, '9999-12-31'::date) >= $3::date`,
        [existing.employee_id, id, targetStart, targetEnd || null]
      );

      if (overlapCheck.rows.length > 0) {
        return res.status(400).json({
          error: `Overlapping active contract detected! Employee already has active contract #${overlapCheck.rows[0].id} covering this date window.`
        });
      }
    }

    const result = await query(
      `UPDATE contracts
       SET department_id = COALESCE($1, department_id),
           job_position_id = COALESCE($2, job_position_id),
           wage = COALESCE($3, wage),
           salary_structure_id = COALESCE($4, salary_structure_id),
           working_schedule_id = COALESCE($5, working_schedule_id),
           start_date = COALESCE($6, start_date),
           end_date = $7,
           status = COALESCE($8, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [department_id, job_position_id, wage, salary_structure_id, working_schedule_id, start_date, targetEnd, targetStatus, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating contract:', err);
    res.status(500).json({ error: 'Failed to update contract.' });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payslips reference this contract
    const payslipCheck = await query('SELECT id FROM payslips WHERE contract_id = $1', [id]);
    if (payslipCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete this contract because historical payslips reference it. Archive or cancel it instead.'
      });
    }

    await query('DELETE FROM contracts WHERE id = $1', [id]);
    res.json({ message: 'Contract deleted successfully.' });
  } catch (err) {
    console.error('Error deleting contract:', err);
    res.status(500).json({ error: 'Failed to delete contract.' });
  }
};
