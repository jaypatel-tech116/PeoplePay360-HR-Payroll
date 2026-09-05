const { query } = require('../config/db');
const { generatePayslipPDF } = require('../services/pdfService');

exports.getPayslips = async (req, res) => {
  try {
    const { employee_id, payrun_id, status } = req.query;
    let where = ['1=1'];
    let params = [];
    let pIdx = 1;

    // Regular employee only sees their own payslips
    if (req.user.role === 'Employee' && req.user.employee_id) {
      where.push(`p.employee_id = $${pIdx}`);
      params.push(req.user.employee_id);
      pIdx++;
    } else if (employee_id) {
      where.push(`p.employee_id = $${pIdx}`);
      params.push(employee_id);
      pIdx++;
    }

    if (payrun_id) {
      where.push(`p.payrun_id = $${pIdx}`);
      params.push(payrun_id);
      pIdx++;
    }

    if (status && status !== 'all') {
      where.push(`p.status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    const sql = `
      SELECT p.*, e.full_name AS employee_name, e.email AS employee_email,
             e.employee_type, d.name AS department_name, j.title AS job_title,
             pr.name AS payrun_name, pr.period_start, pr.period_end,
             s.name AS structure_name, c.wage AS contract_wage,
             COUNT(pw.id) AS warnings_count
      FROM payslips p
      JOIN employees e ON p.employee_id = e.id
      JOIN contracts c ON p.contract_id = c.id
      JOIN payruns pr ON p.payrun_id = pr.id
      JOIN salary_structures s ON pr.salary_structure_id = s.id
      JOIN departments d ON e.department_id = d.id
      JOIN job_positions j ON e.job_position_id = j.id
      LEFT JOIN payslip_warnings pw ON pw.payslip_id = p.id
      WHERE ${where.join(' AND ')}
      GROUP BY p.id, e.id, d.name, j.title, pr.id, s.name, c.wage
      ORDER BY pr.period_start DESC, e.full_name ASC
    `;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching payslips:', err);
    res.status(500).json({ error: 'Failed to fetch payslips.' });
  }
};

exports.getPayslipById = async (req, res) => {
  try {
    const { id } = req.params;

    const psRes = await query(
      `SELECT p.*, e.full_name AS employee_name, e.email AS employee_email,
              e.employee_type, e.bank_account_number, e.ifsc_code, e.bank_verified,
              d.name AS department_name, j.title AS job_title,
              pr.name AS payrun_name, pr.period_start, pr.period_end,
              s.name AS structure_name, c.wage AS contract_wage
       FROM payslips p
       JOIN employees e ON p.employee_id = e.id
       JOIN contracts c ON p.contract_id = c.id
       JOIN payruns pr ON p.payrun_id = pr.id
       JOIN salary_structures s ON pr.salary_structure_id = s.id
       JOIN departments d ON e.department_id = d.id
       JOIN job_positions j ON e.job_position_id = j.id
       WHERE p.id = $1`,
      [id]
    );

    if (psRes.rows.length === 0) {
      return res.status(404).json({ error: 'Payslip not found.' });
    }

    const payslip = psRes.rows[0];

    // Access control: regular employee can only view their own
    if (req.user.role === 'Employee' && req.user.employee_id !== payslip.employee_id) {
      return res.status(403).json({ error: 'Forbidden: You cannot view another employee’s payslip.' });
    }

    // Fetch lines in sequence order
    const linesRes = await query(
      `SELECT * FROM payslip_lines
       WHERE payslip_id = $1
       ORDER BY sequence ASC`,
      [id]
    );

    // Fetch warnings
    const warningsRes = await query(
      `SELECT * FROM payslip_warnings
       WHERE payslip_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    payslip.lines = linesRes.rows;
    payslip.warnings = warningsRes.rows;

    res.json(payslip);
  } catch (err) {
    console.error('Error fetching payslip detail:', err);
    res.status(500).json({ error: 'Failed to fetch payslip details.' });
  }
};

exports.getPayslipPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership if role is Employee
    if (req.user.role === 'Employee') {
      const ownerCheck = await query('SELECT employee_id FROM payslips WHERE id = $1', [id]);
      if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].employee_id !== req.user.employee_id) {
        return res.status(403).json({ error: 'Forbidden: You cannot download this payslip.' });
      }
    }

    const pdfBuffer = await generatePayslipPDF(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Payslip_${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating payslip PDF:', err);
    res.status(500).json({ error: 'Failed to generate payslip PDF: ' + err.message });
  }
};
