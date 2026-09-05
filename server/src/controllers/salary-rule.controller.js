const { pool } = require("../config/mysqlDb");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get salary structures with assigned employee counts
 */
const getSalaryStructures = async (req, res, next) => {
  try {
    const [structures] = await pool.query(`
      SELECT 
        ss.*,
        COUNT(DISTINCT c.employee_id) AS assigned_employees,
        COUNT(DISTINCT sr.id) AS rule_count
      FROM salary_structures ss
      LEFT JOIN contracts c ON c.salary_structure_id = ss.id AND c.status = 'ACTIVE'
      LEFT JOIN salary_rules sr ON sr.salary_structure_id = ss.id
      GROUP BY ss.id
      ORDER BY ss.id ASC;
    `);

    return successResponse(res, {
      statusCode: 200,
      message: "Salary structures retrieved successfully.",
      data: { structures },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create salary structure
 */
const createSalaryStructure = async (req, res, next) => {
  try {
    const { name, code, description, type } = req.body;
    if (!name || !code) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Structure name and code are required.",
      });
    }

    const [result] = await pool.query(`
      INSERT INTO salary_structures (name, code, description, type, is_active)
      VALUES (?, ?, ?, ?, true);
    `, [name.trim(), code.trim().toUpperCase(), description || null, type || 'FT']);

    const [created] = await pool.query(`SELECT * FROM salary_structures WHERE id = ?;`, [result.insertId]);

    return successResponse(res, {
      statusCode: 201,
      message: "Salary structure created successfully.",
      data: { structure: created[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get salary rules with category sub-filters (All, Earnings, Deductions, Other)
 */
const getSalaryRules = async (req, res, next) => {
  try {
    const { category, salary_structure_id } = req.query;
    let sql = `
      SELECT 
        sr.*,
        ss.name AS structure_name,
        ss.code AS structure_code
      FROM salary_rules sr
      LEFT JOIN salary_structures ss ON sr.salary_structure_id = ss.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== "ALL") {
      if (category === "EARNINGS") {
        sql += ` AND sr.category IN ('BASIC', 'ALLOWANCE')`;
      } else if (category === "DEDUCTIONS") {
        sql += ` AND sr.category = 'DEDUCTION'`;
      } else if (category === "OTHER") {
        sql += ` AND sr.category IN ('GROSS', 'NET', 'CONTRIBUTION', 'OTHER')`;
      } else {
        sql += ` AND sr.category = ?`;
        params.push(category);
      }
    }

    if (salary_structure_id) {
      sql += ` AND sr.salary_structure_id = ?`;
      params.push(salary_structure_id);
    }

    sql += ` ORDER BY sr.sequence ASC, sr.id ASC;`;

    const [rules] = await pool.query(sql, params);

    // Counts for sub-filter pills: All, Earnings, Deductions, Other
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN category IN ('BASIC', 'ALLOWANCE') THEN 1 ELSE 0 END) AS earnings,
        SUM(CASE WHEN category = 'DEDUCTION' THEN 1 ELSE 0 END) AS deductions,
        SUM(CASE WHEN category IN ('GROSS', 'NET', 'CONTRIBUTION', 'OTHER') THEN 1 ELSE 0 END) AS other
      FROM salary_rules;
    `);

    return successResponse(res, {
      statusCode: 200,
      message: "Salary rules retrieved successfully.",
      data: {
        rules,
        counts: counts[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create salary rule
 */
const createSalaryRule = async (req, res, next) => {
  try {
    const {
      salary_structure_id,
      name,
      code,
      category,
      calculation_type,
      percentage,
      fixed_amount,
      formula,
      sequence,
    } = req.body;

    if (!name || !code || !category || !salary_structure_id) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Name, code, category, and salary_structure_id are required.",
      });
    }

    const [result] = await pool.query(`
      INSERT INTO salary_rules (
        salary_structure_id, name, code, category, calculation_type,
        percentage, fixed_amount, formula, sequence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      salary_structure_id,
      name.trim(),
      code.trim().toUpperCase(),
      category,
      calculation_type || 'FIXED',
      percentage || null,
      fixed_amount || null,
      formula || null,
      sequence || 10,
    ]);

    const [created] = await pool.query(`SELECT * FROM salary_rules WHERE id = ?;`, [result.insertId]);

    return successResponse(res, {
      statusCode: 201,
      message: "Salary rule created successfully.",
      data: { rule: created[0] },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalaryStructures,
  createSalaryStructure,
  getSalaryRules,
  createSalaryRule,
};
