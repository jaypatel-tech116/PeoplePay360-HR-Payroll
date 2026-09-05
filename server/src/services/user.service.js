const crypto = require("crypto");
const { pool } = require("../config/mysqlDb");

/**
 * Find user by ID (excludes password_hash for security)
 * @param {string} id - UUID or string ID of user
 * @returns {Promise<object|null>}
 */
const findUserById = async (id) => {
  const sql = `
    SELECT 
      u.id, 
      u.email, 
      u.full_name, 
      u.role_id, 
      r.code AS role, 
      r.name AS role_name, 
      u.employee_id, 
      e.employee_code, 
      e.first_name, 
      e.last_name, 
      e.designation, 
      u.is_active, 
      u.created_at, 
      u.updated_at, 
      u.last_login_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.id = ?
    LIMIT 1;
  `;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};

/**
 * Find user by email (includes password_hash for credential verification)
 * @param {string} email
 * @returns {Promise<object|null>}
 */
const findUserByEmail = async (email) => {
  const sql = `
    SELECT 
      u.id, 
      u.email, 
      u.full_name, 
      u.role_id, 
      r.code AS role, 
      r.name AS role_name, 
      u.employee_id, 
      e.employee_code, 
      e.first_name, 
      e.last_name, 
      e.designation, 
      u.password_hash,
      u.is_active, 
      u.created_at, 
      u.updated_at, 
      u.last_login_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE LOWER(u.email) = LOWER(?) AND u.is_active = true
    LIMIT 1;
  `;
  const [rows] = await pool.query(sql, [email]);
  return rows[0] || null;
};

/**
 * Check if an email already exists in users
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const checkEmailExists = async (email) => {
  const sql = `
    SELECT id FROM users
    WHERE LOWER(email) = LOWER(?)
    LIMIT 1;
  `;
  const [rows] = await pool.query(sql, [email]);
  return rows.length > 0;
};

/**
 * Create a new user with email and hashed password
 * Creates employee record and users record in MySQL
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.passwordHash
 * @param {string} [params.fullName]
 * @param {string} [params.roleCode='EMPLOYEE']
 * @returns {Promise<object>}
 */
const createUser = async ({ email, passwordHash, fullName, roleCode = "EMPLOYEE" }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const userId = "usr-" + crypto.randomUUID().slice(0, 8);
  const name = fullName || normalizedEmail.split("@")[0];

  // 1. Fetch role ID
  const [roles] = await pool.query(`SELECT id, code, name FROM roles WHERE code = ? LIMIT 1;`, [roleCode]);
  const role = roles[0];
  if (!role) {
    throw new Error(`Role '${roleCode}' not found in database.`);
  }

  // 2. Create basic employee record
  const employeeCode = "EMP" + Math.floor(1000 + Math.random() * 9000);
  const [empResult] = await pool.query(`
    INSERT INTO employees (
      employee_code, first_name, last_name, email,
      joining_date, status
    ) VALUES (
      ?, ?, 'User', ?,
      CURDATE(), 'ACTIVE'
    );
  `, [employeeCode, name, normalizedEmail]);
  const employeeId = empResult.insertId;

  // 3. Insert into users
  await pool.query(`
    INSERT INTO users (id, role_id, employee_id, email, password_hash, full_name, is_active)
    VALUES (?, ?, ?, ?, ?, ?, true);
  `, [userId, role.id, employeeId, normalizedEmail, passwordHash, name]);

  return {
    id: userId,
    role_id: role.id,
    role: role.code,
    role_name: role.name,
    employee_id: employeeId,
    employee_code: employeeCode,
    email: normalizedEmail,
    full_name: name,
    is_active: true,
  };
};

/**
 * Update user last login timestamp
 * @param {string} userId
 */
const updateLastLogin = async (userId) => {
  await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = ?;`, [userId]);
};

/**
 * List all users with role and employee information
 */
const listUsers = async () => {
  const sql = `
    SELECT 
      u.id, 
      u.email, 
      u.full_name, 
      u.role_id, 
      r.code AS role, 
      r.name AS role_name, 
      u.employee_id, 
      e.employee_code, 
      e.designation,
      d.name AS department_name,
      u.is_active, 
      u.last_login_at,
      u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN employees e ON u.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY u.created_at ASC;
  `;
  const [rows] = await pool.query(sql);
  return rows;
};

/**
 * List all available roles
 */
const listRoles = async () => {
  const [rows] = await pool.query(`
    SELECT r.*, COUNT(u.id) AS user_count
    FROM roles r
    LEFT JOIN users u ON r.id = u.role_id
    GROUP BY r.id
    ORDER BY r.id ASC;
  `);
  return rows;
};

/**
 * Update user role or status
 */
const updateUser = async (id, { roleId, isActive, fullName }) => {
  const updates = [];
  const params = [];

  if (roleId !== undefined) {
    updates.push("role_id = ?");
    params.push(roleId);
  }
  if (isActive !== undefined) {
    updates.push("is_active = ?");
    params.push(isActive);
  }
  if (fullName !== undefined) {
    updates.push("full_name = ?");
    params.push(fullName);
  }

  if (updates.length === 0) return findUserById(id);

  params.push(id);
  await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?;`, params);
  return findUserById(id);
};

module.exports = {
  findUserById,
  findUserByEmail,
  checkEmailExists,
  createUser,
  updateLastLogin,
  listUsers,
  listRoles,
  updateUser,
};
