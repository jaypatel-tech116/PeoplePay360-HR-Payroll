const { query } = require('../config/db');
const { createAuditLog } = require('../services/auditService');

exports.getUsers = async (req, res) => {
  try {
    let sql = `
      SELECT u.id, u.name, u.email, u.avatar_url, u.is_active, u.created_at, u.company_id, u.email_verified,
             r.id AS role_id, r.name AS role,
             e.id AS employee_id, e.full_name AS employee_name,
             c.name AS company_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.employee_id = e.id
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role !== 'Admin' && req.user.company_id) {
      sql += ` AND u.company_id = $1`;
      params.push(req.user.company_id);
    }

    sql += ` ORDER BY u.id ASC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const result = await query('SELECT * FROM roles ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Failed to fetch roles.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
      return res.status(400).json({ error: 'role_id is required.' });
    }

    // Fetch existing user
    const existingRes = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const existing = existingRes.rows[0];

    const result = await query(
      `UPDATE users
       SET role_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, role_id`,
      [role_id, id]
    );

    await createAuditLog({
      userId: req.user.id,
      companyId: existing.company_id,
      action: 'user_role_changed',
      tableName: 'users',
      recordId: id,
      oldValues: { role_id: existing.role_id },
      newValues: { role_id },
      ipAddress: req.ip
    });

    res.json({ message: 'User role updated successfully.', user: result.rows[0] });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const existingRes = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const existing = existingRes.rows[0];

    // Prevent self-deactivation
    if (parseInt(id, 10) === req.user.id && !is_active) {
      return res.status(400).json({ error: 'You cannot deactivate your own account.' });
    }

    const result = await query(
      `UPDATE users
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, is_active`,
      [is_active, id]
    );

    await createAuditLog({
      userId: req.user.id,
      companyId: existing.company_id,
      action: is_active ? 'user_activated' : 'user_deactivated',
      tableName: 'users',
      recordId: id,
      oldValues: { is_active: existing.is_active },
      newValues: { is_active },
      ipAddress: req.ip
    });

    res.json({ message: `User status changed to ${is_active ? 'active' : 'inactive'}.`, user: result.rows[0] });
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
};
