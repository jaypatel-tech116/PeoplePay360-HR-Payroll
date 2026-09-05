const { query } = require('../config/db');
const { createAuditLog } = require('../services/auditService');

exports.getAttendances = async (req, res) => {
  try {
    const { employee_id, date, status, department_id } = req.query;
    let where = ['1=1'];
    let params = [];
    let pIdx = 1;

    // Company scoping
    if (req.user?.company_id && req.user.role !== 'Admin') {
      where.push(`e.company_id = $${pIdx++}`);
      params.push(req.user.company_id);
    }

    // Regular employee only sees own attendance
    if (req.user.role === 'Employee' && req.user.employee_id) {
      where.push(`a.employee_id = $${pIdx++}`);
      params.push(req.user.employee_id);
    } else if (employee_id) {
      where.push(`a.employee_id = $${pIdx++}`);
      params.push(employee_id);
    }

    if (date) {
      where.push(`DATE(a.check_in) = $${pIdx}::date`);
      params.push(date);
      pIdx++;
    }

    if (status && status !== 'all') {
      where.push(`a.status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    if (department_id && department_id !== 'all') {
      where.push(`e.department_id = $${pIdx}`);
      params.push(department_id);
      pIdx++;
    }

    const sql = `
      SELECT a.*, e.full_name AS employee_name, e.email AS employee_email,
             d.name AS department_name, u.name AS corrected_by_name
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON a.corrected_by = u.id
      WHERE ${where.join(' AND ')}
      ORDER BY a.check_in DESC
      LIMIT 200
    `;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching attendances:', err);
    res.status(500).json({ error: 'Failed to fetch attendance records.' });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const empId = req.user.employee_id;
    if (!empId) {
      return res.json({ checkedIn: false, record: null });
    }

    const result = await query(
      `SELECT * FROM attendances
       WHERE employee_id = $1 AND DATE(check_in) = CURRENT_DATE
       ORDER BY check_in DESC
       LIMIT 1`,
      [empId]
    );

    if (result.rows.length === 0) {
      return res.json({ checkedIn: false, record: null });
    }

    const record = result.rows[0];
    const checkedIn = record.check_out === null;
    res.json({ checkedIn, record });
  } catch (err) {
    console.error('Error fetching today status:', err);
    res.status(500).json({ error: 'Failed to check today attendance status.' });
  }
};

exports.checkIn = async (req, res) => {
  try {
    let empId = req.user.employee_id;
    if (req.body.employee_id && req.user.role !== 'Employee') {
      empId = req.body.employee_id;
    }

    if (!empId) {
      return res.status(400).json({ error: 'User is not linked to an employee record.' });
    }

    // Check if open check-in already exists
    const openCheck = await query(
      `SELECT id FROM attendances
       WHERE employee_id = $1 AND check_out IS NULL
       ORDER BY check_in DESC LIMIT 1`,
      [empId]
    );

    if (openCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You are already checked in. Please check out first.' });
    }

    const now = new Date();
    // Check if check-in is late (after 09:30 AM local time)
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isLate = (hour > 9) || (hour === 9 && minute > 30);
    const status = isLate ? 'late' : 'normal';

    const result = await query(
      `INSERT INTO attendances (employee_id, check_in, status)
       VALUES ($1, CURRENT_TIMESTAMP, $2)
       RETURNING *`,
      [empId, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Failed to record check-in.' });
  }
};

exports.checkOut = async (req, res) => {
  try {
    let empId = req.user.employee_id;
    if (req.body.employee_id && req.user.role !== 'Employee') {
      empId = req.body.employee_id;
    }

    if (!empId) {
      return res.status(400).json({ error: 'User is not linked to an employee record.' });
    }

    // Find active check-in
    const activeRes = await query(
      `SELECT * FROM attendances
       WHERE employee_id = $1 AND check_out IS NULL
       ORDER BY check_in DESC LIMIT 1`,
      [empId]
    );

    if (activeRes.rows.length === 0) {
      return res.status(400).json({ error: 'No active check-in found for today.' });
    }

    const activeRec = activeRes.rows[0];
    const checkInTime = new Date(activeRec.check_in);
    const now = new Date();
    const diffHours = parseFloat(((now - checkInTime) / (1000 * 60 * 60)).toFixed(2));

    let status = activeRec.status;
    if (diffHours >= 9.5) {
      status = 'overtime';
    }

    const updateRes = await query(
      `UPDATE attendances
       SET check_out = CURRENT_TIMESTAMP,
           worked_hours = $1,
           status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [diffHours, status, activeRec.id]
    );

    res.json(updateRes.rows[0]);
  } catch (err) {
    console.error('Check-out error:', err);
    res.status(500).json({ error: 'Failed to record check-out.' });
  }
};

exports.correctAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, correction_note } = req.body;

    if (!check_in || !correction_note) {
      return res.status(400).json({ error: 'check_in and a correction_note explaining the change are required.' });
    }

    let workedHours = 0;
    let status = 'corrected';

    if (check_out) {
      const cIn = new Date(check_in);
      const cOut = new Date(check_out);
      workedHours = parseFloat(((cOut - cIn) / (1000 * 60 * 60)).toFixed(2));
    } else {
      status = 'missing_checkout';
    }

    const result = await query(
      `UPDATE attendances
       SET check_in = $1,
           check_out = $2,
           worked_hours = $3,
           status = $4,
           corrected_by = $5,
           correction_note = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [check_in, check_out || null, workedHours, status, req.user.id, correction_note, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Correction error:', err);
    res.status(500).json({ error: 'Failed to correct attendance.' });
  }
};
