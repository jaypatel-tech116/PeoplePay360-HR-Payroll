const { query } = require('../config/db');

exports.getDepartments = async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*, p.name AS parent_department_name,
              COUNT(DISTINCT e.id) AS employee_count
       FROM departments d
       LEFT JOIN departments p ON d.parent_department_id = p.id
       LEFT JOIN employees e ON e.department_id = d.id
       GROUP BY d.id, p.name
       ORDER BY d.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments.' });
  }
};

exports.getJobPositions = async (req, res) => {
  try {
    const { department_id } = req.query;
    let where = ['1=1'];
    let params = [];

    if (department_id) {
      where.push('j.department_id = $1');
      params.push(department_id);
    }

    const result = await query(
      `SELECT j.*, d.name AS department_name
       FROM job_positions j
       JOIN departments d ON j.department_id = d.id
       WHERE ${where.join(' AND ')}
       ORDER BY j.title ASC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching job positions:', err);
    res.status(500).json({ error: 'Failed to fetch job positions.' });
  }
};
