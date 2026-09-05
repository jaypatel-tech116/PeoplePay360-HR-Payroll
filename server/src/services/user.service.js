const crypto = require("crypto");
const { pool } = require("../config/mysqlDb");

/**
 * Find user by ID (excludes password_hash for security)
 * Includes linked employee, department, and role details
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
      e.department_id,
      d.name AS department_name,
      e.phone,
      e.joining_date,
      e.status AS employee_status,
      u.is_active, 
      u.created_at, 
      u.updated_at, 
      u.last_login_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN employees e ON u.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE u.id = ?
    LIMIT 1;
  `;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};

/**
 * Find user by email (includes password_hash for credential verification)
 * @param {string} email
 * @param {boolean} includeInactive - whether to retrieve deactivated users for status reporting
 * @returns {Promise<object|null>}
 */
const findUserByEmail = async (email, includeInactive = true) => {
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
    WHERE LOWER(u.email) = LOWER(?) ${includeInactive ? "" : "AND u.is_active = true"}
    LIMIT 1;
  `;
  const [rows] = await pool.query(sql, [email]);
  return rows[0] || null;
};

/**
 * Check if an email already exists in users
 * @param {string} email
 * @param {string} [excludeId]
 * @returns {Promise<boolean>}
 */
const checkEmailExists = async (email, excludeId = null) => {
  let sql = `SELECT id FROM users WHERE LOWER(email) = LOWER(?)`;
  const params = [email];
  if (excludeId) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }
  sql += ` LIMIT 1;`;
  const [rows] = await pool.query(sql, params);
  return rows.length > 0;
};

/**
 * Create a new user with email, hashed password, and associated employee profile
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.passwordHash
 * @param {string} [params.fullName]
 * @param {string} [params.roleCode='EMPLOYEE']
 * @param {number} [params.departmentId]
 * @param {string} [params.designation]
 * @param {string} [params.phone]
 * @returns {Promise<object>}
 */
const createUser = async ({
  email,
  passwordHash,
  fullName,
  roleCode = "EMPLOYEE",
  departmentId = null,
  designation = null,
  phone = null,
}) => {
  const normalizedEmail = email.toLowerCase().trim();
  const userId = "usr-" + crypto.randomUUID().slice(0, 8);
  const name = fullName || normalizedEmail.split("@")[0];
  const nameParts = name.trim().split(" ");
  const firstName = nameParts[0] || name;
  const lastName = nameParts.slice(1).join(" ") || "User";

  // 1. Fetch role ID
  const [roles] = await pool.query(
    `SELECT id, code, name FROM roles WHERE code = ? LIMIT 1;`,
    [roleCode]
  );
  const role = roles[0];
  if (!role) {
    throw new Error(`Role '${roleCode}' not found in database.`);
  }

  // 2. Create employee record with department and designation
  const employeeCode = "EMP" + Math.floor(1000 + Math.random() * 9000);
  const [empResult] = await pool.query(
    `INSERT INTO employees (
      employee_code, first_name, last_name, email, phone,
      department_id, designation, joining_date, status
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, CURDATE(), 'ACTIVE'
    );`,
    [
      employeeCode,
      firstName,
      lastName,
      normalizedEmail,
      phone || null,
      departmentId || null,
      designation || (role.name || "Staff"),
    ]
  );
  const employeeId = empResult.insertId;

  // 3. Insert into users table
  await pool.query(
    `INSERT INTO users (id, role_id, employee_id, email, password_hash, full_name, is_active)
     VALUES (?, ?, ?, ?, ?, ?, true);`,
    [userId, role.id, employeeId, normalizedEmail, passwordHash, name]
  );

  return findUserById(userId);
};

/**
 * Update user last login timestamp
 * @param {string} userId
 */
const updateLastLogin = async (userId) => {
  await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = ?;`, [userId]);
};

/**
 * List all users with role and employee information, supporting filters
 */
const listUsers = async ({ role = null, status = null, search = null } = {}) => {
  let sql = `
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
      e.department_id,
      d.name AS department_name,
      e.phone,
      e.joining_date,
      u.is_active, 
      e.status AS employee_status,
      u.last_login_at,
      u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN employees e ON u.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (role && role !== "ALL" && role !== "All Roles") {
    sql += " AND r.code = ?";
    params.push(role);
  }

  if (status !== undefined && status !== null && status !== "ALL" && status !== "All Status") {
    if (status === "ACTIVE" || status === "Active" || status === "1" || status === true) {
      sql += " AND u.is_active = 1";
    } else if (status === "INACTIVE" || status === "Inactive" || status === "0" || status === false) {
      sql += " AND u.is_active = 0";
    }
  }

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    sql += ` AND (
      u.full_name LIKE ? OR
      u.email LIKE ? OR
      e.employee_code LIKE ? OR
      d.name LIKE ? OR
      e.designation LIKE ?
    )`;
    params.push(q, q, q, q, q);
  }

  sql += " ORDER BY u.created_at DESC;";
  const [rows] = await pool.query(sql, params);
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
 * Update user role, status, profile, or credentials
 * Synchronizes with linked employee record
 */
const updateUser = async (
  id,
  { roleId, roleCode, isActive, fullName, email, departmentId, designation, phone, passwordHash }
) => {
  const currentUser = await findUserById(id);
  if (!currentUser) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  // Resolve roleId if roleCode provided
  let resolvedRoleId = roleId;
  if (!resolvedRoleId && roleCode) {
    const [roles] = await pool.query(`SELECT id FROM roles WHERE code = ? LIMIT 1;`, [roleCode]);
    if (roles.length > 0) resolvedRoleId = roles[0].id;
  }

  // 1. Update users table
  const userUpdates = [];
  const userParams = [];

  if (resolvedRoleId !== undefined && resolvedRoleId !== null) {
    userUpdates.push("role_id = ?");
    userParams.push(resolvedRoleId);
  }
  if (isActive !== undefined && isActive !== null) {
    userUpdates.push("is_active = ?");
    userParams.push(isActive ? 1 : 0);
  }
  if (fullName !== undefined && fullName !== null) {
    userUpdates.push("full_name = ?");
    userParams.push(fullName.trim());
  }
  if (email !== undefined && email !== null) {
    userUpdates.push("email = ?");
    userParams.push(email.toLowerCase().trim());
  }
  if (passwordHash) {
    userUpdates.push("password_hash = ?");
    userParams.push(passwordHash);
  }

  if (userUpdates.length > 0) {
    userParams.push(id);
    await pool.query(`UPDATE users SET ${userUpdates.join(", ")} WHERE id = ?;`, userParams);
  }

  // 2. Update linked employee record if employee_id exists
  if (currentUser.employee_id) {
    const empUpdates = [];
    const empParams = [];

    if (fullName !== undefined && fullName !== null) {
      const parts = fullName.trim().split(" ");
      const first = parts[0] || fullName;
      const last = parts.slice(1).join(" ") || currentUser.last_name || "";
      empUpdates.push("first_name = ?", "last_name = ?");
      empParams.push(first, last);
    }
    if (email !== undefined && email !== null) {
      empUpdates.push("email = ?");
      empParams.push(email.toLowerCase().trim());
    }
    if (phone !== undefined && phone !== null) {
      empUpdates.push("phone = ?");
      empParams.push(phone);
    }
    if (departmentId !== undefined) {
      empUpdates.push("department_id = ?");
      empParams.push(departmentId || null);
    }
    if (designation !== undefined) {
      empUpdates.push("designation = ?");
      empParams.push(designation || null);
    }
    if (isActive !== undefined && isActive !== null) {
      empUpdates.push("status = ?");
      empParams.push(isActive ? "ACTIVE" : "INACTIVE");
    }

    if (empUpdates.length > 0) {
      empParams.push(currentUser.employee_id);
      await pool.query(`UPDATE employees SET ${empUpdates.join(", ")} WHERE id = ?;`, empParams);
    }
  }

  return findUserById(id);
};

/**
 * Soft delete / deactivate user (is_active = 0)
 */
const deactivateUser = async (id) => {
  return updateUser(id, { isActive: false });
};

/**
 * Reactivate user (is_active = 1)
 */
const activateUser = async (id) => {
  return updateUser(id, { isActive: true });
};

/**
 * Get aggregated counts across all stakeholders
 */
const getStakeholderStats = async () => {
  const [totalRows] = await pool.query(`
    SELECT 
      COUNT(*) AS total_users,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_users,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS deactivated_users
    FROM users;
  `);

  const [roleBreakdown] = await pool.query(`
    SELECT 
      r.code, 
      r.name, 
      COUNT(u.id) AS total_count,
      SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END) AS active_count,
      SUM(CASE WHEN u.is_active = 0 THEN 1 ELSE 0 END) AS deactivated_count
    FROM roles r
    LEFT JOIN users u ON r.id = u.role_id
    GROUP BY r.id, r.code, r.name
    ORDER BY r.id ASC;
  `);

  return {
    summary: {
      totalUsers: parseInt(totalRows[0]?.total_users || 0),
      activeUsers: parseInt(totalRows[0]?.active_users || 0),
      deactivatedUsers: parseInt(totalRows[0]?.deactivated_users || 0),
    },
    roles: roleBreakdown.map((rb) => ({
      code: rb.code,
      name: rb.name,
      totalCount: parseInt(rb.total_count || 0),
      activeCount: parseInt(rb.active_count || 0),
      deactivatedCount: parseInt(rb.deactivated_count || 0),
    })),
  };
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
  deactivateUser,
  activateUser,
  getStakeholderStats,
};
