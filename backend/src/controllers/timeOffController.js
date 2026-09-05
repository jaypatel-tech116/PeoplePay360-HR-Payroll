const { query } = require('../config/db');
const { approveTimeOffRequest, refuseTimeOffRequest } = require('../services/timeOffService');

// --- 1. Time Off Types ---
exports.getTypes = async (req, res) => {
  try {
    const result = await query('SELECT * FROM time_off_types ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching time off types:', err);
    res.status(500).json({ error: 'Failed to fetch time off types.' });
  }
};

exports.createType = async (req, res) => {
  try {
    const { name, unit = 'days', requires_allocation = true, approval_required = true, affects_payroll = false } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const result = await query(
      `INSERT INTO time_off_types (name, unit, requires_allocation, approval_required, affects_payroll)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, unit, requires_allocation, approval_required, affects_payroll]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating time off type:', err);
    res.status(500).json({ error: 'Failed to create time off type.' });
  }
};

// --- 2. Time Off Allocations ---
exports.getAllocations = async (req, res) => {
  try {
    const { employee_id } = req.query;
    let where = ['1=1'];
    let params = [];
    let pIdx = 1;

    // Standard employee only sees own allocations
    if (req.user.role === 'Employee' && req.user.employee_id) {
      where.push(`a.employee_id = $${pIdx}`);
      params.push(req.user.employee_id);
      pIdx++;
    } else if (employee_id) {
      where.push(`a.employee_id = $${pIdx}`);
      params.push(employee_id);
      pIdx++;
    }

    const sql = `
      SELECT a.*, e.full_name AS employee_name, e.email AS employee_email,
             t.name AS leave_type_name, t.unit
      FROM time_off_allocations a
      JOIN employees e ON a.employee_id = e.id
      JOIN time_off_types t ON a.time_off_type_id = t.id
      WHERE ${where.join(' AND ')}
      ORDER BY a.valid_from DESC
    `;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching time off allocations:', err);
    res.status(500).json({ error: 'Failed to fetch allocations.' });
  }
};

exports.createAllocation = async (req, res) => {
  try {
    const { employee_id, time_off_type_id, allocated_amount, valid_from, valid_to, status = 'approved' } = req.body;
    if (!employee_id || !time_off_type_id || !allocated_amount || !valid_from || !valid_to) {
      return res.status(400).json({ error: 'Missing required allocation fields.' });
    }

    const amount = parseFloat(allocated_amount);
    const result = await query(
      `INSERT INTO time_off_allocations
       (employee_id, time_off_type_id, allocated_amount, taken_amount, remaining_amount, valid_from, valid_to, status)
       VALUES ($1, $2, $3, 0.00, $3, $4, $5, $6)
       RETURNING *`,
      [employee_id, time_off_type_id, amount, valid_from, valid_to, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating allocation:', err);
    res.status(500).json({ error: 'Failed to create allocation.' });
  }
};

// --- 3. Time Off Requests ---
exports.getRequests = async (req, res) => {
  try {
    const { employee_id, status } = req.query;
    let where = ['1=1'];
    let params = [];
    let pIdx = 1;

    // Standard employee only sees own requests
    if (req.user.role === 'Employee' && req.user.employee_id) {
      where.push(`r.employee_id = $${pIdx}`);
      params.push(req.user.employee_id);
      pIdx++;
    } else if (employee_id) {
      where.push(`r.employee_id = $${pIdx}`);
      params.push(employee_id);
      pIdx++;
    }

    if (status && status !== 'all') {
      where.push(`r.status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    const sql = `
      SELECT r.*, e.full_name AS employee_name, e.email AS employee_email,
             d.name AS department_name,
             t.name AS leave_type_name, t.unit, t.requires_allocation,
             u.name AS approved_by_name
      FROM time_off_requests r
      JOIN employees e ON r.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      JOIN time_off_types t ON r.time_off_type_id = t.id
      LEFT JOIN users u ON r.approved_by = u.id
      WHERE ${where.join(' AND ')}
      ORDER BY r.created_at DESC
    `;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching time off requests:', err);
    res.status(500).json({ error: 'Failed to fetch time off requests.' });
  }
};

exports.createRequest = async (req, res) => {
  try {
    let { employee_id, time_off_type_id, date_from, date_to, duration, reason } = req.body;

    // If regular employee, force employee_id to be their own
    if (req.user.role === 'Employee') {
      if (!req.user.employee_id) {
        return res.status(400).json({ error: 'Your user account is not linked to an employee record.' });
      }
      employee_id = req.user.employee_id;
    }

    if (!employee_id || !time_off_type_id || !date_from || !date_to) {
      return res.status(400).json({ error: 'Employee, leave type, and start/end dates are required.' });
    }

    // Auto calculate duration if not passed
    if (!duration) {
      const d1 = new Date(date_from);
      const d2 = new Date(date_to);
      const diffTime = Math.abs(d2 - d1);
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const result = await query(
      `INSERT INTO time_off_requests
       (employee_id, time_off_type_id, date_from, date_to, duration, status, reason)
       VALUES ($1, $2, $3, $4, $5, 'submitted', $6)
       RETURNING *`,
      [employee_id, time_off_type_id, date_from, date_to, duration, reason || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating time off request:', err);
    res.status(500).json({ error: 'Failed to submit time off request.' });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    // Calls atomic service
    const updatedRequest = await approveTimeOffRequest(id, req.user.id);
    res.json({ message: 'Time off request approved successfully and allocation updated.', request: updatedRequest });
  } catch (err) {
    console.error('Error approving time off request:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.refuseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    // Calls atomic service
    const updatedRequest = await refuseTimeOffRequest(id, req.user.id);
    res.json({ message: 'Time off request refused.', request: updatedRequest });
  } catch (err) {
    console.error('Error refusing time off request:', err.message);
    res.status(400).json({ error: err.message });
  }
};
