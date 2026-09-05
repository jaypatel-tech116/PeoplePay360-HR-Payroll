const { pool } = require("../config/mysqlDb");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get all working schedules
 */
const getSchedules = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*, 
        COUNT(e.id) AS assigned_employees
      FROM working_schedules s
      LEFT JOIN employees e ON e.schedule_id = s.id
      GROUP BY s.id
      ORDER BY s.id ASC;
    `);
    return successResponse(res, {
      statusCode: 200,
      message: "Working schedules retrieved successfully.",
      data: { schedules: rows },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new working schedule
 */
const createSchedule = async (req, res, next) => {
  try {
    const { name, code, description, hours_per_day, days_per_week, start_time, end_time } = req.body;
    if (!name || !code) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Schedule name and code are required.",
      });
    }

    const startTime = start_time || "09:00:00";
    const endTime = end_time || "18:00:00";
    const breakMin = req.body.break_minutes || 60;
    const weeklyHrs = req.body.weekly_hours || (hours_per_day ? (hours_per_day * (days_per_week || 5)) : 40.00);

    const [result] = await pool.query(
      `INSERT INTO working_schedules (
        name, code, description,
        monday_start, monday_end,
        tuesday_start, tuesday_end,
        wednesday_start, wednesday_end,
        thursday_start, thursday_end,
        friday_start, friday_end,
        break_minutes, weekly_hours, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true);`,
      [
        name.trim(),
        code.trim().toUpperCase(),
        description || null,
        startTime, endTime,
        startTime, endTime,
        startTime, endTime,
        startTime, endTime,
        startTime, endTime,
        breakMin,
        weeklyHrs,
      ]
    );

    const [created] = await pool.query(`SELECT * FROM working_schedules WHERE id = ?;`, [result.insertId]);

    return successResponse(res, {
      statusCode: 201,
      message: "Working schedule created successfully.",
      data: { schedule: created[0] },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchedules,
  createSchedule,
};
