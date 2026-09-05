const nodemailer = require('nodemailer');
const { query } = require('../config/db');
const { generatePayslipPDF } = require('./pdfService');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Generate test Ethereal transport for zero-config live demo
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('Ethereal test mailer initialized for PeoplePay360 demo:', testAccount.user);
  }
  return transporter;
}

/**
 * Bulk send payslips for an entire payrun
 */
async function sendPayrunPayslips(payrunId) {
  const mailer = await getTransporter();

  // Fetch all payslips for the payrun
  const slipsRes = await query(
    `SELECT p.id, e.full_name, e.email, pr.name AS payrun_name,
            pr.period_start, pr.period_end
     FROM payslips p
     JOIN employees e ON p.employee_id = e.id
     JOIN payruns pr ON p.payrun_id = pr.id
     WHERE p.payrun_id = $1`,
    [payrunId]
  );

  const results = [];

  for (const slip of slipsRes.rows) {
    try {
      // 1. Generate PDF buffer
      const pdfBuffer = await generatePayslipPDF(slip.id);

      // 2. Dispatch email
      const info = await mailer.sendMail({
        from: '"PeoplePay360 Payroll Operations" <payroll@peoplepay360.com>',
        to: slip.email,
        subject: `Your Official Payslip - ${slip.payrun_name}`,
        text: `Dear ${slip.full_name},\n\nPlease find attached your official payslip for ${slip.payrun_name} (${slip.period_start.toISOString().split('T')[0]} to ${slip.period_end.toISOString().split('T')[0]}).\n\nBest regards,\nPeoplePay360 Payroll Team`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #673AB7;">PeoplePay360 Official Payslip</h2>
            <p>Dear <strong>${slip.full_name}</strong>,</p>
            <p>Your official payslip for <strong>${slip.payrun_name}</strong> is generated and ready.</p>
            <p>Please review the attached PDF document for your earnings, deductions, and net salary breakdown.</p>
            <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">This is an automated notification from PeoplePay360 Operations.</p>
          </div>
        `,
        attachments: [
          {
            filename: `Payslip_${slip.full_name.replace(/\s+/g, '_')}_${slip.id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      // 3. Mark delivery in DB
      await query(
        `UPDATE payslips
         SET email_sent = true,
             email_sent_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [slip.id]
      );

      const previewUrl = nodemailer.getTestMessageUrl(info);
      results.push({
        payslipId: slip.id,
        employee: slip.full_name,
        email: slip.email,
        success: true,
        previewUrl: previewUrl || null
      });
    } catch (err) {
      console.error(`Failed to send payslip email for employee ${slip.full_name}:`, err.message);
      results.push({
        payslipId: slip.id,
        employee: slip.full_name,
        email: slip.email,
        success: false,
        error: err.message
      });
    }
  }

  return results;
}

module.exports = {
  getTransporter,
  sendPayrunPayslips
};
