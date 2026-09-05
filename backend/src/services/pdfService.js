const PDFDocument = require('pdfkit');
const { query } = require('../config/db');

/**
 * Generates a professional PDF document for a payslip
 */
async function generatePayslipPDF(payslipId) {
  // Query comprehensive payslip details
  const psRes = await query(
    `SELECT p.*, e.full_name AS employee_name, e.email AS employee_email,
            e.bank_account_number, e.ifsc_code, e.employee_type,
            d.name AS department_name, j.title AS job_title,
            pr.name AS payrun_name, pr.period_start, pr.period_end,
            c.wage AS contract_wage, s.name AS structure_name
     FROM payslips p
     JOIN employees e ON p.employee_id = e.id
     JOIN contracts c ON p.contract_id = c.id
     JOIN payruns pr ON p.payrun_id = pr.id
     JOIN salary_structures s ON pr.salary_structure_id = s.id
     JOIN departments d ON e.department_id = d.id
     JOIN job_positions j ON e.job_position_id = j.id
     WHERE p.id = $1`,
    [payslipId]
  );

  if (psRes.rows.length === 0) {
    throw new Error('Payslip not found.');
  }

  const slip = psRes.rows[0];

  // Query lines
  const linesRes = await query(
    `SELECT * FROM payslip_lines
     WHERE payslip_id = $1
     ORDER BY sequence ASC`,
    [payslipId]
  );
  const lines = linesRes.rows;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Header with Color Banner ---
      doc.rect(40, 40, 515, 60).fill('#673AB7'); // Odoo Purple

      doc.fillColor('#FFFFFF')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('PeoplePay360', 55, 52);

      doc.fontSize(10)
         .font('Helvetica')
         .text('Enterprise HR & Payroll Platform • Official Payslip', 55, 78);

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(`STATUS: ${slip.status.toUpperCase()}`, 400, 62, { align: 'right' });

      // --- Employee & Period Info Box ---
      doc.rect(40, 115, 515, 110).lineWidth(1).strokeColor('#E0E0E0').stroke();

      doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold');
      doc.text('Employee Information', 55, 125);
      doc.text('Payment & Period Details', 320, 125);

      doc.font('Helvetica').fontSize(9).fillColor('#555555');

      // Left Column
      doc.text(`Name: ${slip.employee_name}`, 55, 145);
      doc.text(`Email: ${slip.employee_email}`, 55, 160);
      doc.text(`Department: ${slip.department_name}`, 55, 175);
      doc.text(`Designation: ${slip.job_title} (${slip.employee_type})`, 55, 190);
      doc.text(`Bank A/C: ${slip.bank_account_number || 'NOT SPECIFIED'} (${slip.ifsc_code || 'N/A'})`, 55, 205);

      // Right Column
      doc.text(`Payrun: ${slip.payrun_name}`, 320, 145);
      doc.text(`Period: ${slip.period_start.toISOString().split('T')[0]} to ${slip.period_end.toISOString().split('T')[0]}`, 320, 160);
      doc.text(`Structure: ${slip.structure_name}`, 320, 175);
      doc.text(`Worked Days: ${slip.worked_days} days`, 320, 190);
      doc.text(`Base Wage: ₹${parseFloat(slip.contract_wage).toLocaleString()}`, 320, 205);

      // --- Line Items Table ---
      let tableTop = 245;

      doc.rect(40, tableTop, 515, 24).fill('#F3F4F6');
      doc.fillColor('#1F2937').font('Helvetica-Bold').fontSize(9);
      doc.text('Code', 55, tableTop + 7);
      doc.text('Rule / Description', 120, tableTop + 7);
      doc.text('Category', 300, tableTop + 7);
      doc.text('Amount (₹)', 440, tableTop + 7, { align: 'right' });

      let currentY = tableTop + 25;
      doc.font('Helvetica').fontSize(9).fillColor('#374151');

      let totalEarnings = 0;
      let totalDeductions = 0;

      lines.forEach((line, index) => {
        const amt = parseFloat(line.amount);
        if (line.category === 'basic' || line.category === 'allowance') {
          totalEarnings += amt;
        } else if (line.category === 'deduction') {
          totalDeductions += amt;
        }

        if (index % 2 === 1) {
          doc.rect(40, currentY - 2, 515, 20).fill('#FAFAFA');
        }

        doc.fillColor('#374151');
        doc.text(line.rule_code, 55, currentY + 3);
        doc.text(line.label, 120, currentY + 3);
        doc.text(line.category.toUpperCase(), 300, currentY + 3);
        doc.text(amt.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 440, currentY + 3, { align: 'right' });

        currentY += 20;
      });

      // --- Summary Section ---
      currentY += 10;
      doc.rect(40, currentY, 515, 65).fill('#F9FAFB');
      doc.rect(40, currentY, 515, 65).lineWidth(1).strokeColor('#E5E7EB').stroke();

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1F2937');
      doc.text(`Total Gross Earnings: ₹${parseFloat(slip.gross_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 55, currentY + 12);
      doc.text(`Total Deductions: ₹${totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 55, currentY + 35);

      doc.fillColor('#673AB7').fontSize(14);
      doc.text(`Net Payable Salary: ₹${parseFloat(slip.net_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 280, currentY + 22, { align: 'right' });

      // --- Footer ---
      doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
      doc.text('This is a computer-generated document authorized by PeoplePay360 HR & Payroll Platform.', 40, 760, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePayslipPDF };
