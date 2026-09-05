const { query } = require('../config/db');

exports.getStructures = async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*,
              COUNT(DISTINCT r.id) AS rule_count,
              COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') AS active_employee_count
       FROM salary_structures s
       LEFT JOIN salary_rules r ON r.salary_structure_id = s.id
       LEFT JOIN contracts c ON c.salary_structure_id = s.id
       GROUP BY s.id
       ORDER BY s.id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching salary structures:', err);
    res.status(500).json({ error: 'Failed to fetch salary structures.' });
  }
};

exports.getStructureById = async (req, res) => {
  try {
    const { id } = req.params;
    const sRes = await query('SELECT * FROM salary_structures WHERE id = $1', [id]);
    if (sRes.rows.length === 0) {
      return res.status(404).json({ error: 'Salary structure not found.' });
    }

    const structure = sRes.rows[0];
    const rulesRes = await query(
      'SELECT * FROM salary_rules WHERE salary_structure_id = $1 ORDER BY sequence ASC',
      [id]
    );
    structure.rules = rulesRes.rows;

    res.json(structure);
  } catch (err) {
    console.error('Error fetching structure detail:', err);
    res.status(500).json({ error: 'Failed to fetch salary structure detail.' });
  }
};

exports.createStructure = async (req, res) => {
  try {
    const { name, description, active = true } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Structure name is required.' });
    }

    const result = await query(
      `INSERT INTO salary_structures (name, description, active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, active]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating structure:', err);
    res.status(500).json({ error: 'Failed to create salary structure.' });
  }
};

exports.updateStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const result = await query(
      `UPDATE salary_structures
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           active = COALESCE($3, active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Salary structure not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating structure:', err);
    res.status(500).json({ error: 'Failed to update salary structure.' });
  }
};

exports.deleteStructure = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if in use by active contracts or payruns
    const contractUse = await query('SELECT id FROM contracts WHERE salary_structure_id = $1 LIMIT 1', [id]);
    if (contractUse.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete structure as it is assigned to employee contracts.' });
    }

    const payrunUse = await query('SELECT id FROM payruns WHERE salary_structure_id = $1 LIMIT 1', [id]);
    if (payrunUse.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete structure as it is referenced by payruns.' });
    }

    await query('DELETE FROM salary_structures WHERE id = $1', [id]);
    res.json({ message: 'Salary structure deleted successfully.' });
  } catch (err) {
    console.error('Error deleting structure:', err);
    res.status(500).json({ error: 'Failed to delete salary structure.' });
  }
};
