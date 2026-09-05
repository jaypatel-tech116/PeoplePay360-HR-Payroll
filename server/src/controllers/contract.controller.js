const { pool } = require("../config/mysqlDb");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get list of contracts with sub-filters (All, Active, Expired, Terminated)
 */
const getContracts = async (req, res, next) => {
  try {
    const { status, department_id, employee_id } = req.query;
    let sql = `
      SELECT 
        c.*,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.designation,
        d.name AS department_name,
        ss.name AS salary_structure_name
      FROM contracts c
      JOIN employees e ON c.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN salary_structures ss ON c.salary_structure_id = ss.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "ALL") {
      sql += ` AND c.status = ?`;
      params.push(status);
    }
    if (department_id) {
      sql += ` AND e.department_id = ?`;
      params.push(department_id);
    }
    if (employee_id) {
      sql += ` AND c.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY c.id ASC;`;

    const [contracts] = await pool.query(sql, params);

    // Counts for sub-filter pills: All, Active, Expired, Terminated
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) AS expired,
        SUM(CASE WHEN status = 'TERMINATED' THEN 1 ELSE 0 END) AS \`terminated\`
      FROM contracts;
    `);

    return successResponse(res, {
      statusCode: 200,
      message: "Contracts retrieved successfully.",
      data: {
        contracts,
        counts: counts[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new contract
 */
const createContract = async (req, res, next) => {
  try {
    const {
      contract_number,
      employee_id,
      salary_structure_id,
      wage,
      contract_type,
      start_date,
      end_date,
      status,
    } = req.body;

    if (!contract_number || !employee_id || !wage || !start_date) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Contract number, employee, wage, and start date are required.",
      });
    }

    const [result] = await pool.query(`
      INSERT INTO contracts (
        contract_number, employee_id, salary_structure_id, wage,
        contract_type, start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      contract_number,
      employee_id,
      salary_structure_id || null,
      wage,
      contract_type || 'Permanent',
      start_date,
      end_date || null,
      status || 'ACTIVE',
    ]);

    const [created] = await pool.query(`SELECT * FROM contracts WHERE id = ?;`, [result.insertId]);

    return successResponse(res, {
      statusCode: 201,
      message: "Contract created successfully.",
      data: { contract: created[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update contract status or terms
 */
const updateContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { wage, salary_structure_id, status, end_date } = req.body;

    const updates = [];
    const params = [];

    if (wage !== undefined) { updates.push("wage = ?"); params.push(wage); }
    if (salary_structure_id !== undefined) { updates.push("salary_structure_id = ?"); params.push(salary_structure_id); }
    if (status !== undefined) { updates.push("status = ?"); params.push(status); }
    if (end_date !== undefined) { updates.push("end_date = ?"); params.push(end_date); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE contracts SET ${updates.join(", ")} WHERE id = ?;`, params);
    }

    const [updated] = await pool.query(`SELECT * FROM contracts WHERE id = ?;`, [id]);

    return successResponse(res, {
      statusCode: 200,
      message: "Contract updated successfully.",
      data: { contract: updated[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Safe delete / terminate contract
 */
const deleteContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE contracts SET status = 'TERMINATED' WHERE id = ?;", [id]);
    return successResponse(res, {
      statusCode: 200,
      message: "Contract terminated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
};

