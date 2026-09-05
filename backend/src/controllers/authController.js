const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { uploadToCloudinary } = require('../middleware/upload');
const sessionService = require('../services/sessionService');
const { createAuditLog } = require('../services/auditService');
const { COOKIE_NAME } = require('../middleware/authenticateSession');

const JWT_SECRET = process.env.JWT_SECRET || 'peoplepay360_secure_jwt_token_secret_2026_odoo';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await query(
      `SELECT u.*, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact an Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create session
    const session = await sessionService.createSession(
      user.id,
      req.ip,
      req.headers['user-agent']
    );

    // Set secure HttpOnly cookie
    res.cookie(COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      companyId: user.company_id,
      action: 'login',
      tableName: 'user_sessions',
      ipAddress: req.ip
    });

    // Get linked employee info if exists
    let employee = null;
    if (user.employee_id) {
      const empRes = await query('SELECT * FROM employees WHERE id = $1', [user.employee_id]);
      if (empRes.rows.length > 0) {
        employee = empRes.rows[0];
      }
    }

    // Get permissions
    const permsRes = await query(
      `SELECT module, action FROM role_permissions WHERE role_id = $1`,
      [user.role_id]
    );
    const permissions = permsRes.rows.map(r => `${r.module}:${r.action}`);

    // Get company info
    let company = null;
    if (user.company_id) {
      const compRes = await query('SELECT id, name, code, currency FROM companies WHERE id = $1', [user.company_id]);
      if (compRes.rows.length > 0) company = compRes.rows[0];
    }

    res.json({
      token: session.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        role_id: user.role_id,
        company_id: user.company_id,
        company,
        permissions,
        employee_id: user.employee_id,
        employee
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

exports.logout = async (req, res) => {
  try {
    const sessionToken = req.cookies?.[COOKIE_NAME] || req.sessionToken;
    if (sessionToken) {
      await sessionService.revokeSession(sessionToken);
    }

    if (req.user) {
      await createAuditLog({
        userId: req.user.id,
        companyId: req.user.company_id,
        action: 'logout',
        tableName: 'user_sessions',
        ipAddress: req.ip
      });
    }

    res.clearCookie(COOKIE_NAME, { httpOnly: true, path: '/' });
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Server error during logout.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'Employee' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Get role ID
    const roleRes = await query('SELECT id, name FROM roles WHERE name = $1', [role]);
    if (roleRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const roleId = roleRes.rows[0].id;
    const passwordHash = await bcrypt.hash(password, 10);

    const insertRes = await query(
      `INSERT INTO users (name, email, password_hash, role_id, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, email, avatar_url, role_id`,
      [name, email.toLowerCase().trim(), passwordHash, roleId]
    );

    const newUser = insertRes.rows[0];
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar_url: newUser.avatar_url,
        role,
        employee_id: null
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    let employee = null;
    if (req.user.employee_id) {
      const empRes = await query(
        `SELECT e.*, d.name AS department_name, j.title AS job_title
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN job_positions j ON e.job_position_id = j.id
         WHERE e.id = $1`,
        [req.user.employee_id]
      );
      if (empRes.rows.length > 0) {
        employee = empRes.rows[0];
      }
    }

    // Fetch permissions
    const roleIdRes = await query(
      `SELECT r.id FROM roles r WHERE r.name = $1`,
      [req.user.role]
    );
    const roleId = roleIdRes.rows[0]?.id;
    let permissions = [];
    if (roleId) {
      const permsRes = await query(
        `SELECT module, action FROM role_permissions WHERE role_id = $1`,
        [roleId]
      );
      permissions = permsRes.rows.map(r => `${r.module}:${r.action}`);
    }

    // Fetch company
    let company = null;
    if (req.user.company_id) {
      const compRes = await query('SELECT id, name, code, currency FROM companies WHERE id = $1', [req.user.company_id]);
      if (compRes.rows.length > 0) company = compRes.rows[0];
    }

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar_url: req.user.avatar_url,
        role: req.user.role,
        role_id: roleId,
        company_id: req.user.company_id,
        company,
        permissions,
        employee_id: req.user.employee_id,
        employee
      }
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error retrieving current session.' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image file to upload.' });
    }

    const avatarUrl = await uploadToCloudinary(req.file.buffer);

    await query('UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      avatarUrl,
      req.user.id
    ]);

    if (req.user.employee_id) {
      await query('UPDATE employees SET photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        avatarUrl,
        req.user.employee_id
      ]);
    }

    res.json({ avatar_url: avatarUrl, message: 'Avatar updated successfully.' });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Failed to upload avatar.' });
  }
};
