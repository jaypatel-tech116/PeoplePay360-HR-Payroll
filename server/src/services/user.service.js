const crypto = require("crypto");
const { query } = require("../config/db");

/**
 * Find user by ID (excludes encrypted_password for safety)
 * @param {string} id - UUID of user
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
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    LEFT JOIN public.employees e ON u.employee_id = e.id
    WHERE u.id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/**
 * Find user by email (includes encrypted_password for credential verification)
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
      a.encrypted_password,
      u.is_active, 
      u.created_at, 
      u.updated_at, 
      u.last_login_at
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    JOIN auth.users a ON u.id = a.id
    LEFT JOIN public.employees e ON u.employee_id = e.id
    WHERE LOWER(u.email) = LOWER($1) AND u.is_active = true
    LIMIT 1;
  `;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

/**
 * Check if an email already exists in public.users
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const checkEmailExists = async (email) => {
  const sql = `
    SELECT id FROM public.users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await query(sql, [email]);
  return result.rows.length > 0;
};

/**
 * Create a new user with email and hashed password
 * Inserts in auth.users, creates employee record, and creates public.users record
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.passwordHash
 * @param {string} [params.roleCode='EMPLOYEE']
 * @returns {Promise<object>}
 */
const createUser = async ({ email, passwordHash, roleCode = "EMPLOYEE" }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const userId = crypto.randomUUID();

  // 1. Fetch role ID
  const roleRes = await query(`SELECT id, code, name FROM public.roles WHERE code = $1 LIMIT 1;`, [roleCode]);
  const roleId = roleRes.rows[0]?.id;
  if (!roleId) {
    throw new Error(`Role ${roleCode} not found in database.`);
  }

  // 2. Insert into auth.users
  await query(`
    INSERT INTO auth.users (
      id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      $1, 'authenticated', 'authenticated', $2, $3, now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now()
    );
  `, [userId, normalizedEmail, passwordHash]);

  // 3. Create basic employee record
  const employeeCode = "EMP" + Math.floor(1000 + Math.random() * 9000);
  const employeeName = normalizedEmail.split("@")[0];
  const empRes = await query(`
    INSERT INTO public.employees (
      employee_code, first_name, last_name, email,
      joining_date, status
    ) VALUES (
      $1, $2, 'User', $3,
      CURRENT_DATE, 'ACTIVE'
    )
    RETURNING id, employee_code;
  `, [employeeCode, employeeName, normalizedEmail]);
  const employeeId = empRes.rows[0]?.id;

  // 4. Insert into public.users
  const userRes = await query(`
    INSERT INTO public.users (id, role_id, employee_id, email, full_name, is_active)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id, role_id, employee_id, email, full_name, is_active, created_at, updated_at;
  `, [userId, roleId, employeeId, normalizedEmail, employeeName]);

  const newUser = userRes.rows[0];
  return {
    ...newUser,
    role: roleRes.rows[0].code,
    role_name: roleRes.rows[0].name,
    employee_code: empRes.rows[0]?.employee_code,
  };
};

/**
 * Update user last login timestamp
 * @param {string} userId
 */
const updateLastLogin = async (userId) => {
  await query(`UPDATE public.users SET last_login_at = now() WHERE id = $1;`, [userId]);
};

module.exports = {
  findUserById,
  findUserByEmail,
  checkEmailExists,
  createUser,
  updateLastLogin,
};
