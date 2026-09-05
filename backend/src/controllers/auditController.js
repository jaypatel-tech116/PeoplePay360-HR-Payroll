/**
 * Audit Log Controller
 * Exposes audit log queries for Administrators and Auditors.
 */
const { getAuditLogs } = require('../services/auditService');

exports.listLogs = async (req, res) => {
  try {
    const { userId, tableName, action, limit = 50, offset = 0 } = req.query;

    // Boundary check: non-admins can only see logs from their own company
    const companyId = req.user.role === 'Admin' ? (req.query.companyId || null) : req.user.company_id;

    const logs = await getAuditLogs({
      companyId,
      userId: userId ? parseInt(userId, 10) : null,
      tableName,
      action,
      limit: Math.min(parseInt(limit, 10) || 50, 100),
      offset: parseInt(offset, 10) || 0
    });

    res.json(logs);
  } catch (err) {
    console.error('List audit logs error:', err);
    res.status(500).json({ error: 'Failed to retrieve audit trail.' });
  }
};
