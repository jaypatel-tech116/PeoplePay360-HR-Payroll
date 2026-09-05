/**
 * Audit Service
 * Creates immutable audit log entries for security-sensitive operations.
 */
const { query } = require('../config/db');

/**
 * Create an audit log entry.
 * @param {object} params
 * @param {number} params.userId - The user performing the action
 * @param {number} params.companyId - The company context
 * @param {string} params.action - Description of the action (e.g. 'login', 'role_change', 'payrun_mark_paid')
 * @param {string} [params.tableName] - The table affected
 * @param {number} [params.recordId] - The record ID affected
 * @param {object} [params.oldValues] - Previous state (for updates)
 * @param {object} [params.newValues] - New state (for creates/updates)
 * @param {string} [params.ipAddress] - Client IP address
 */
async function createAuditLog({ userId, companyId, action, tableName, recordId, oldValues, newValues, ipAddress }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, company_id, action, table_name, record_id, old_values, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId || null,
        companyId || null,
        action,
        tableName || null,
        recordId || null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress || null
      ]
    );
  } catch (err) {
    // Audit logging should never break the main operation
    console.error('Audit log write error (non-fatal):', err.message);
  }
}

/**
 * Get audit logs with pagination and filters.
 */
async function getAuditLogs({ companyId, userId, tableName, action, limit = 50, offset = 0 }) {
  let sql = `
    SELECT al.*, u.name AS user_name, u.email AS user_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramIdx = 1;

  if (companyId) {
    sql += ` AND al.company_id = $${paramIdx++}`;
    params.push(companyId);
  }
  if (userId) {
    sql += ` AND al.user_id = $${paramIdx++}`;
    params.push(userId);
  }
  if (tableName) {
    sql += ` AND al.table_name = $${paramIdx++}`;
    params.push(tableName);
  }
  if (action) {
    sql += ` AND al.action ILIKE $${paramIdx++}`;
    params.push(`%${action}%`);
  }

  sql += ` ORDER BY al.created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
}

module.exports = { createAuditLog, getAuditLogs };
