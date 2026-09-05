/**
 * Company Controller
 * Manages companies/organizations in PeoplePay360
 */
const { query } = require('../config/db');
const { createAuditLog } = require('../services/auditService');

/**
 * Public endpoint: list active companies for registration dropdown
 */
exports.listPublicCompanies = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, domain, logo_url FROM companies WHERE is_active = true ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List public companies error:', err);
    res.status(500).json({ error: 'Failed to retrieve companies.' });
  }
};

/**
 * Admin endpoint: full company list with member counts
 */
exports.listCompanies = async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*,
              COUNT(DISTINCT e.id)::int AS employee_count,
              COUNT(DISTINCT u.id)::int AS user_count
       FROM companies c
       LEFT JOIN employees e ON e.company_id = c.id
       LEFT JOIN users u ON u.company_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List companies error:', err);
    res.status(500).json({ error: 'Failed to retrieve companies list.' });
  }
};

/**
 * Get company details
 */
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Boundary check: non-admins can only see their own company
    if (req.user.role !== 'Admin' && parseInt(id, 10) !== req.user.company_id) {
      return res.status(403).json({ error: 'Forbidden. You do not have access to this company.' });
    }

    const result = await query(`SELECT * FROM companies WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get company error:', err);
    res.status(500).json({ error: 'Failed to retrieve company details.' });
  }
};

/**
 * Create a new company (Admin only)
 */
exports.createCompany = async (req, res) => {
  try {
    const { name, domain, logo_url } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Company name is required.' });
    }

    const result = await query(
      `INSERT INTO companies (name, domain, logo_url, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [name.trim(), domain ? domain.trim().toLowerCase() : null, logo_url || null]
    );

    const newCompany = result.rows[0];

    await createAuditLog({
      userId: req.user.id,
      companyId: newCompany.id,
      action: 'company_created',
      tableName: 'companies',
      recordId: newCompany.id,
      newValues: newCompany,
      ipAddress: req.ip
    });

    res.status(201).json(newCompany);
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({ error: 'Failed to create company.' });
  }
};

/**
 * Update company (Admin only)
 */
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, logo_url, is_active } = req.body;

    const existingRes = await query('SELECT * FROM companies WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    const existing = existingRes.rows[0];

    const result = await query(
      `UPDATE companies
       SET name = COALESCE($1, name),
           domain = COALESCE($2, domain),
           logo_url = COALESCE($3, logo_url),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, domain, logo_url, is_active, id]
    );

    const updated = result.rows[0];

    await createAuditLog({
      userId: req.user.id,
      companyId: updated.id,
      action: 'company_updated',
      tableName: 'companies',
      recordId: updated.id,
      oldValues: existing,
      newValues: updated,
      ipAddress: req.ip
    });

    res.json(updated);
  } catch (err) {
    console.error('Update company error:', err);
    res.status(500).json({ error: 'Failed to update company.' });
  }
};
