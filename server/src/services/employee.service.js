const { pool } = require("../config/mysqlDb");

/**
 * List employees with search, department filter, and status filter
 */
const listEmployees = async ({ search = "", department_id, status, employee_type }) => {
  let sql = `
    SELECT 
      e.*,
      d.name AS department_name,
      d.code AS department_code,
      s.name AS schedule_name,
      c.id AS active_contract_id,
      c.contract_number,
      c.wage,
      c.status AS contract_status,
      ss.name AS salary_structure_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN working_schedules s ON e.schedule_id = s.id
    LEFT JOIN contracts c ON c.employee_id = e.id AND c.status = 'ACTIVE'
    LEFT JOIN salary_structures ss ON c.salary_structure_id = ss.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ` AND (
      LOWER(e.first_name) LIKE LOWER(?) OR 
      LOWER(e.last_name) LIKE LOWER(?) OR 
      LOWER(e.employee_code) LIKE LOWER(?) OR 
      LOWER(e.email) LIKE LOWER(?) OR
      LOWER(e.designation) LIKE LOWER(?)
    )`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term, term);
  }

  if (department_id) {
    sql += ` AND e.department_id = ?`;
    params.push(department_id);
  }

  if (status) {
    sql += ` AND e.status = ?`;
    params.push(status);
  }

  if (employee_type) {
    sql += ` AND e.employee_type = ?`;
    params.push(employee_type);
  }

  sql += ` ORDER BY e.id ASC;`;

  const [rows] = await pool.query(sql, params);
  return rows;
};

/**
 * Get comprehensive employee profile with tabs (Overview, Contracts, Attendance, Leaves, Payslips)
 */
const getEmployeeById = async (id) => {
  // 1. Employee Core Details
  const [empRows] = await pool.query(`
    SELECT 
      e.*,
      d.name AS department_name,
      s.name AS schedule_name,
      s.weekly_hours,
      u.email AS user_email,
      u.last_login_at
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN working_schedules s ON e.schedule_id = s.id
    LEFT JOIN users u ON u.employee_id = e.id
    WHERE e.id = ? OR e.employee_code = ?
    LIMIT 1;
  `, [id, id]);

  const employee = empRows[0];
  if (!employee) return null;

  // 2. Contracts
  const [contracts] = await pool.query(`
    SELECT c.*, ss.name AS salary_structure_name, ss.code AS salary_structure_code
    FROM contracts c
    LEFT JOIN salary_structures ss ON c.salary_structure_id = ss.id
    WHERE c.employee_id = ?
    ORDER BY c.start_date DESC;
  `, [employee.id]);

  // 3. Attendance (Recent 15 logs)
  const [attendance] = await pool.query(`
    SELECT * FROM attendance
    WHERE employee_id = ?
    ORDER BY attendance_date DESC
    LIMIT 15;
  `, [employee.id]);

  // 4. Leaves (Requests and Allocations)
  const [leaveRequests] = await pool.query(`
    SELECT lr.*, lt.name AS leave_type_name
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = ?
    ORDER BY lr.start_date DESC;
  `, [employee.id]);

  const [leaveAllocations] = await pool.query(`
    SELECT la.*, lt.name AS leave_type_name
    FROM leave_allocations la
    JOIN leave_types lt ON la.leave_type_id = lt.id
    WHERE la.employee_id = ?;
  `, [employee.id]);

  // 5. Payslips
  const [payslips] = await pool.query(`
    SELECT p.*, pr.run_number, pr.month, pr.year, pr.pay_date
    FROM payslips p
    JOIN payruns pr ON p.payrun_id = pr.id
    WHERE p.employee_id = ?
    ORDER BY p.period_start DESC;
  `, [employee.id]);

  return {
    ...employee,
    contracts,
    attendance,
    leaves: {
      requests: leaveRequests,
      allocations: leaveAllocations,
    },
    payslips,
  };
};

/**
 * Create a new employee with initial contract
 */
const createEmployee = async (data) => {
  const {
    employee_code,
    first_name,
    last_name,
    email,
    phone,
    department_id,
    manager_id,
    schedule_id,
    designation,
    joining_date,
    employee_type,
    wage,
    salary_structure_id,
    pan_number,
    uan_number,
    bank_account,
    work_location,
  } = data;

  const [result] = await pool.query(`
    INSERT INTO employees (
      employee_code, first_name, last_name, email, phone,
      department_id, manager_id, schedule_id, designation, joining_date,
      employee_type, status, pan_number, uan_number,
      bank_account, work_location
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?);
  `, [
    employee_code,
    first_name,
    last_name,
    email,
    phone || null,
    department_id || null,
    manager_id || null,
    schedule_id || null,
    designation || null,
    joining_date || new Date(),
    employee_type || 'FULL_TIME',
    pan_number || null,
    uan_number || null,
    bank_account || null,
    work_location || 'Bangalore Office',
  ]);

  const employeeId = result.insertId;

  // If wage and salary_structure_id provided, create initial active contract
  if (wage && salary_structure_id) {
    const contractNum = `CON-${employee_code}-${new Date().getFullYear()}`;
    await pool.query(`
      INSERT INTO contracts (
        employee_id, contract_number, start_date, contract_type,
        wage, currency, pay_frequency, salary_structure_id, status
      ) VALUES (?, ?, ?, 'Permanent', ?, 'INR', 'MONTHLY', ?, 'ACTIVE');
    `, [
      employeeId,
      contractNum,
      joining_date || new Date(),
      wage,
      salary_structure_id,
    ]);
  }

  return getEmployeeById(employeeId);
};

/**
 * Update employee record
 */
const updateEmployee = async (id, data) => {
  const allowed = [
    'first_name', 'last_name', 'email', 'phone', 'department_id',
    'manager_id', 'schedule_id', 'designation', 'employee_type', 'status',
    'pan_number', 'uan_number', 'bank_account', 'work_location'
  ];

  const updates = [];
  const params = [];

  for (const field of allowed) {
    if (data[field] !== undefined) {
      updates.push(`\`${field}\` = ?`);
      params.push(data[field]);
    }
  }

  if (updates.length > 0) {
    params.push(id);
    await pool.query(`UPDATE employees SET ${updates.join(", ")} WHERE id = ?;`, params);
  }

  return getEmployeeById(id);
};

module.exports = {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
};
