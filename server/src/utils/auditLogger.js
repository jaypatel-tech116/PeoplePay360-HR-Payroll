const { pool } = require("../config/mysqlDb");

/**
 * Standard Audit Logger for HR Module actions
 * Inserts structured log into audit_logs table
 *
 * @param {object} params
 * @param {string} [params.userId] - User ID who performed the action
 * @param {string} params.action - Action string e.g. 'EMPLOYEE_CREATED', 'LEAVE_APPROVED'
 * @param {string} params.entityType - 'EMPLOYEE', 'LEAVE_REQUEST', 'ATTENDANCE', etc.
 * @param {number|string} [params.entityId] - Target entity primary key ID
 * @param {object} [params.oldData] - State before mutation
 * @param {object} [params.newData] - State after mutation
 */
const logAudit = async ({
  userId = null,
  action,
  entityType,
  entityId = null,
  oldData = null,
  newData = null,
}) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        action,
        entityType,
        entityId ? String(entityId) : null,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
      ]
    );
  } catch (err) {
    console.error("⚠️ Audit logger warning:", err.message);
  }
};

module.exports = {
  logAudit,
};
