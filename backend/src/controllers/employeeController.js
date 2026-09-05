const { query } = require('../config/db');
const { createAuditLog } = require('../services/auditService');

exports.getEmployees = async (req, res) => {
  try {
    const { department_id, status, employee_type, search } = req.query;

    let where = ['1=1'];
    let params = [];
    let pIdx = 1;

    // Multi-company isolation
    if (req.user?.company_id && req.user.role !== 'Admin') {
      where.push(`e.company_id = $${pIdx++}`);
      params.push(req.user.company_id);
    }

    // Role-based scope: regular Employee only sees themselves
    if (req.user?.role === 'Employee') {
      where.push(`e.id = $${pIdx++}`);
      params.push(req.user.employee_id);
    }

    if (department_id && department_id !== 'all') {
      where.push(`e.department_id = $${pIdx++}`);
      params.push(department_id);
    }

    if (status && status !== 'all') {
      where.push(`e.status = $${pIdx++}`);
      params.push(status);
    }

    if (employee_type && employee_type !== 'all') {
      where.push(`e.employee_type = $${pIdx++}`);
      params.push(employee_type);
    }

    if (search) {
      where.push(`(e.full_name ILIKE $${pIdx} OR e.email ILIKE $${pIdx} OR j.title ILIKE $${pIdx})`);
      params.push(`%${search}%`);
      pIdx++;
    }

    const sql = `
      SELECT e.*, d.name AS department_name, j.title AS job_title,
             m.full_name AS manager_name, ws.name AS schedule_name,
             c.wage AS current_wage, c.id AS current_contract_id
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN job_positions j ON e.job_position_id = j.id
      LEFT JOIN employees m ON e.manager_id = m.id
      LEFT JOIN working_schedules ws ON e.working_schedule_id = ws.id
      LEFT JOIN contracts c ON c.employee_id = e.id AND c.status = 'active'
      WHERE ${where.join(' AND ')}
      ORDER BY e.id ASC
    `;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees.' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    // IDOR protection: employee can only view their own record
    if (req.user?.role === 'Employee' && parseInt(id, 10) !== req.user.employee_id) {
      return res.status(403).json({ error: 'Access denied. You may only view your own employee profile.' });
    }

    const result = await query(
      `SELECT e.*, d.name AS department_name, j.title AS job_title,
              m.full_name AS manager_name, ws.name AS schedule_name,
              c.wage AS current_wage, c.id AS current_contract_id
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN job_positions j ON e.job_position_id = j.id
       LEFT JOIN employees m ON e.manager_id = m.id
       LEFT JOIN working_schedules ws ON e.working_schedule_id = ws.id
       LEFT JOIN contracts c ON c.employee_id = e.id AND c.status = 'active'
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching employee detail:', err);
    res.status(500).json({ error: 'Failed to fetch employee details.' });
  }
};

exports.getEmployeeSmartCounts = async (req, res) => {
  try {
    const { id } = req.params;

    const contractsCountRes = await query(
      'SELECT COUNT(*) AS count FROM contracts WHERE employee_id = $1',
      [id]
    );
    const attendanceCountRes = await query(
      'SELECT COUNT(*) AS count FROM attendances WHERE employee_id = $1',
      [id]
    );
    const timeOffRequestsRes = await query(
      'SELECT COUNT(*) AS count FROM time_off_requests WHERE employee_id = $1',
      [id]
    );
    const timeOffAllocationsRes = await query(
      'SELECT COUNT(*) AS count FROM time_off_allocations WHERE employee_id = $1',
      [id]
    );
    const payslipsCountRes = await query(
      'SELECT COUNT(*) AS count FROM payslips WHERE employee_id = $1',
      [id]
    );

    res.json({
      contracts: parseInt(contractsCountRes.rows[0].count, 10),
      attendance: parseInt(attendanceCountRes.rows[0].count, 10),
      timeOffRequests: parseInt(timeOffRequestsRes.rows[0].count, 10),
      allocations: parseInt(timeOffAllocationsRes.rows[0].count, 10),
      payslips: parseInt(payslipsCountRes.rows[0].count, 10)
    });
  } catch (err) {
    console.error('Error fetching employee counts:', err);
    res.status(500).json({ error: 'Failed to fetch employee related record counts.' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const {
      full_name, email, phone, department_id, manager_id,
      job_position_id, working_schedule_id, status = 'active',
      employee_type = 'full_time', bank_account_number, ifsc_code,
      bank_verified = false, hire_date, photo_url
    } = req.body;

    if (!full_name || !email || !department_id || !job_position_id || !working_schedule_id || !hire_date) {
      return res.status(400).json({ error: 'Please provide all mandatory employee fields.' });
    }

    const checkEmail = await query('SELECT id FROM employees WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'An employee with this email already exists.' });
    }

    const companyId = req.user?.company_id || req.body.company_id || 1;

    const result = await query(
      `INSERT INTO employees
       (full_name, email, phone, department_id, manager_id, job_position_id, working_schedule_id,
        status, employee_type, bank_account_number, ifsc_code, bank_verified, hire_date, photo_url, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        full_name, email, phone, department_id, manager_id || null, job_position_id,
        working_schedule_id, status, employee_type, bank_account_number || null,
        ifsc_code || null, bank_verified, hire_date, photo_url || null, companyId
      ]
    );

    const newEmp = result.rows[0];

    await createAuditLog({
      userId: req.user?.id,
      companyId,
      action: 'employee_created',
      tableName: 'employees',
      recordId: newEmp.id,
      newValues: newEmp,
      ipAddress: req.ip
    });

    res.status(201).json(newEmp);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: 'Failed to create employee.' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name, email, phone, department_id, manager_id,
      job_position_id, working_schedule_id, status,
      employee_type, bank_account_number, ifsc_code,
      bank_verified, hire_date, photo_url
    } = req.body;

    const existingRes = await query('SELECT * FROM employees WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }
    const existing = existingRes.rows[0];

    const result = await query(
      `UPDATE employees
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           department_id = COALESCE($4, department_id),
           manager_id = $5,
           job_position_id = COALESCE($6, job_position_id),
           working_schedule_id = COALESCE($7, working_schedule_id),
           status = COALESCE($8, status),
           employee_type = COALESCE($9, employee_type),
           bank_account_number = $10,
           ifsc_code = $11,
           bank_verified = COALESCE($12, bank_verified),
           hire_date = COALESCE($13, hire_date),
           photo_url = COALESCE($14, photo_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $15
       RETURNING *`,
      [
        full_name, email, phone, department_id, manager_id || null,
        job_position_id, working_schedule_id, status, employee_type,
        bank_account_number, ifsc_code, bank_verified, hire_date,
        photo_url, id
      ]
    );

    const updated = result.rows[0];

    await createAuditLog({
      userId: req.user?.id,
      companyId: existing.company_id,
      action: 'employee_updated',
      tableName: 'employees',
      recordId: updated.id,
      oldValues: existing,
      newValues: updated,
      ipAddress: req.ip
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Failed to update employee.' });
  }
};

exports.getEmployeeContracts = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT c.*, s.name AS structure_name, ws.name AS schedule_name
       FROM contracts c
       JOIN salary_structures s ON c.salary_structure_id = s.id
       JOIN working_schedules ws ON c.working_schedule_id = ws.id
       WHERE c.employee_id = $1
       ORDER BY c.start_date DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employee contracts:', err);
    res.status(500).json({ error: 'Failed to fetch employee contracts.' });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.*, u.name AS corrected_by_name
       FROM attendances a
       LEFT JOIN users u ON a.corrected_by = u.id
       WHERE a.employee_id = $1
       ORDER BY a.check_in DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employee attendances:', err);
    res.status(500).json({ error: 'Failed to fetch employee attendance.' });
  }
};

exports.getEmployeeTimeOff = async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await query(
      `SELECT r.*, t.name AS leave_type_name, t.unit, u.name AS approved_by_name
       FROM time_off_requests r
       JOIN time_off_types t ON r.time_off_type_id = t.id
       LEFT JOIN users u ON r.approved_by = u.id
       WHERE r.employee_id = $1
       ORDER BY r.date_from DESC`,
      [id]
    );

    const allocations = await query(
      `SELECT a.*, t.name AS leave_type_name, t.unit
       FROM time_off_allocations a
       JOIN time_off_types t ON a.time_off_type_id = t.id
       WHERE a.employee_id = $1
       ORDER BY a.valid_from DESC`,
      [id]
    );

    res.json({
      requests: requests.rows,
      allocations: allocations.rows
    });
  } catch (err) {
    console.error('Error fetching employee time off:', err);
    res.status(500).json({ error: 'Failed to fetch employee time off data.' });
  }
};
