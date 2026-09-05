const { pool } = require("../config/mysqlDb");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get system audit trail
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { entity_type, limit = 50 } = req.query;
    let sql = `
      SELECT 
        a.*,
        u.email AS user_email,
        u.full_name AS user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (entity_type) {
      sql += ` AND a.entity_type = ?`;
      params.push(entity_type);
    }

    sql += ` ORDER BY a.created_at DESC LIMIT ?;`;
    params.push(parseInt(limit, 10));

    const [logs] = await pool.query(sql, params);

    return successResponse(res, {
      statusCode: 200,
      message: "Audit logs retrieved successfully.",
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
};
