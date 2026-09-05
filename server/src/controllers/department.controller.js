const { pool } = require("../config/mysqlDb");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get all departments with live employee counts
 */
const getDepartments = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        d.id, 
        d.name, 
        d.code, 
        d.description, 
        d.is_active, 
        d.created_at,
        COUNT(e.id) AS employee_count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'ACTIVE'
      GROUP BY d.id
      ORDER BY d.id ASC;
    `;
    const [rows] = await pool.query(sql);
    return successResponse(res, {
      statusCode: 200,
      message: "Departments retrieved successfully.",
      data: { departments: rows },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new department
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Department name and code are required.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO departments (name, code, description, is_active) VALUES (?, ?, ?, true);`,
      [name.trim(), code.trim().toUpperCase(), description || null]
    );

    const [created] = await pool.query(`SELECT * FROM departments WHERE id = ?;`, [result.insertId]);

    return successResponse(res, {
      statusCode: 201,
      message: "Department created successfully.",
      data: { department: created[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update department
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const updates = [];
    const params = [];

    if (name) { updates.push("name = ?"); params.push(name); }
    if (description !== undefined) { updates.push("description = ?"); params.push(description); }
    if (is_active !== undefined) { updates.push("is_active = ?"); params.push(is_active); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE departments SET ${updates.join(", ")} WHERE id = ?;`, params);
    }

    const [updated] = await pool.query(`SELECT * FROM departments WHERE id = ?;`, [id]);

    return successResponse(res, {
      statusCode: 200,
      message: "Department updated successfully.",
      data: { department: updated[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Safe delete / deactivate department
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE departments SET is_active = false WHERE id = ?;", [id]);
    return successResponse(res, {
      statusCode: 200,
      message: "Department deactivated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

