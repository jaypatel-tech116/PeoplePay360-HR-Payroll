const { query } = require('../config/db');

exports.getAllRules = async (req, res) => {
  try {
    const { salary_structure_id } = req.query;
    let text = 'SELECT * FROM salary_rules';
    const params = [];
    if (salary_structure_id) {
      text += ' WHERE salary_structure_id = $1';
      params.push(salary_structure_id);
    }
    text += ' ORDER BY sequence ASC';
    const result = await query(text, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching all rules:', err);
    res.status(500).json({ error: 'Failed to fetch salary rules.' });
  }
};


exports.getRulesByStructure = async (req, res) => {
  try {
    const { structureId } = req.params;
    const result = await query(
      `SELECT * FROM salary_rules
       WHERE salary_structure_id = $1
       ORDER BY sequence ASC`,
      [structureId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching rules:', err);
    res.status(500).json({ error: 'Failed to fetch salary rules.' });
  }
};

exports.createRule = async (req, res) => {
  try {
    const { structureId } = req.params;
    const {
      name, code, category, sequence = 1,
      computation_method, amount, percentage_of_rule_code, formula, active = true
    } = req.body;

    if (!name || !code || !category || !computation_method) {
      return res.status(400).json({ error: 'Name, code, category, and computation method are required.' });
    }

    const result = await query(
      `INSERT INTO salary_rules
       (salary_structure_id, name, code, category, sequence, computation_method, amount, percentage_of_rule_code, formula, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        structureId, name, code.toUpperCase(), category, sequence,
        computation_method, amount !== undefined ? amount : null,
        percentage_of_rule_code || null, formula || null, active
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating rule:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A rule with this code already exists in this salary structure.' });
    }
    res.status(500).json({ error: 'Failed to create salary rule.' });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, code, category, sequence,
      computation_method, amount, percentage_of_rule_code, formula, active
    } = req.body;

    const result = await query(
      `UPDATE salary_rules
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           category = COALESCE($3, category),
           sequence = COALESCE($4, sequence),
           computation_method = COALESCE($5, computation_method),
           amount = $6,
           percentage_of_rule_code = $7,
           formula = $8,
           active = COALESCE($9, active)
       WHERE id = $10
       RETURNING *`,
      [
        name, code ? code.toUpperCase() : null, category, sequence,
        computation_method, amount !== undefined ? amount : null,
        percentage_of_rule_code || null, formula || null, active, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Salary rule not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating rule:', err);
    res.status(500).json({ error: 'Failed to update salary rule.' });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM salary_rules WHERE id = $1', [id]);
    res.json({ message: 'Salary rule deleted successfully.' });
  } catch (err) {
    console.error('Error deleting rule:', err);
    res.status(500).json({ error: 'Failed to delete salary rule.' });
  }
};
