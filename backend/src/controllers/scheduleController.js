const { query, pool } = require('../config/db');

function calculateTotalWeeklyHours(lines = []) {
  let totalMinutes = 0;
  for (const line of lines) {
    if (!line.start_time || !line.end_time) continue;

    const [startH, startM] = line.start_time.split(':').map(Number);
    const [endH, endM] = line.end_time.split(':').map(Number);
    const breakMins = parseInt(line.break_duration_minutes || 0, 10);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    const diff = endTotal - startTotal - breakMins;
    if (diff > 0) {
      totalMinutes += diff;
    }
  }
  return parseFloat((totalMinutes / 60).toFixed(2));
}

exports.getSchedules = async (req, res) => {
  try {
    const schedulesRes = await query(
      `SELECT ws.*,
              COUNT(DISTINCT e.id) AS assigned_employees_count,
              COUNT(DISTINCT c.id) AS assigned_contracts_count
       FROM working_schedules ws
       LEFT JOIN employees e ON e.working_schedule_id = ws.id
       LEFT JOIN contracts c ON c.working_schedule_id = ws.id AND c.status = 'active'
       GROUP BY ws.id
       ORDER BY ws.id ASC`
    );

    const schedules = schedulesRes.rows;

    // Fetch lines for each schedule
    for (const s of schedules) {
      const linesRes = await query(
        'SELECT * FROM working_schedule_lines WHERE working_schedule_id = $1 ORDER BY day_of_week ASC',
        [s.id]
      );
      s.lines = linesRes.rows;
    }

    res.json(schedules);
  } catch (err) {
    console.error('Error fetching working schedules:', err);
    res.status(500).json({ error: 'Failed to fetch working schedules.' });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedRes = await query('SELECT * FROM working_schedules WHERE id = $1', [id]);
    if (schedRes.rows.length === 0) {
      return res.status(404).json({ error: 'Working schedule not found.' });
    }

    const schedule = schedRes.rows[0];
    const linesRes = await query(
      'SELECT * FROM working_schedule_lines WHERE working_schedule_id = $1 ORDER BY day_of_week ASC',
      [id]
    );
    schedule.lines = linesRes.rows;

    res.json(schedule);
  } catch (err) {
    console.error('Error fetching working schedule detail:', err);
    res.status(500).json({ error: 'Failed to fetch working schedule details.' });
  }
};

exports.createSchedule = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { name, schedule_type = 'full_time', lines = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Schedule name is required.' });
    }

    // Always compute total_weekly_hours server-side!
    const totalWeeklyHours = calculateTotalWeeklyHours(lines);

    const schedRes = await client.query(
      `INSERT INTO working_schedules (name, schedule_type, total_weekly_hours)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, schedule_type, totalWeeklyHours]
    );
    const newSchedule = schedRes.rows[0];

    const insertedLines = [];
    for (const l of lines) {
      const lineRes = await client.query(
        `INSERT INTO working_schedule_lines
         (working_schedule_id, day_of_week, start_time, end_time, break_duration_minutes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [newSchedule.id, l.day_of_week, l.start_time, l.end_time, l.break_duration_minutes || 0]
      );
      insertedLines.push(lineRes.rows[0]);
    }

    await client.query('COMMIT');
    newSchedule.lines = insertedLines;
    res.status(201).json(newSchedule);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating working schedule:', err);
    res.status(500).json({ error: 'Failed to create working schedule.' });
  } finally {
    client.release();
  }
};

exports.updateSchedule = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { name, schedule_type, lines } = req.body;

    // Check existing
    const existingRes = await client.query('SELECT * FROM working_schedules WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }

    let totalWeeklyHours = existingRes.rows[0].total_weekly_hours;
    let updatedLines = [];

    if (lines && Array.isArray(lines)) {
      // Recompute total hours
      totalWeeklyHours = calculateTotalWeeklyHours(lines);

      // Replace lines
      await client.query('DELETE FROM working_schedule_lines WHERE working_schedule_id = $1', [id]);
      for (const l of lines) {
        const lineRes = await client.query(
          `INSERT INTO working_schedule_lines
           (working_schedule_id, day_of_week, start_time, end_time, break_duration_minutes)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [id, l.day_of_week, l.start_time, l.end_time, l.break_duration_minutes || 0]
        );
        updatedLines.push(lineRes.rows[0]);
      }
    }

    const schedRes = await client.query(
      `UPDATE working_schedules
       SET name = COALESCE($1, name),
           schedule_type = COALESCE($2, schedule_type),
           total_weekly_hours = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, schedule_type, totalWeeklyHours, id]
    );

    await client.query('COMMIT');
    const result = schedRes.rows[0];
    result.lines = updatedLines;
    res.json(result);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating working schedule:', err);
    res.status(500).json({ error: 'Failed to update working schedule.' });
  } finally {
    client.release();
  }
};
