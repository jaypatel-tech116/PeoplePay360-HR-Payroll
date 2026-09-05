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

/**
 * Send an OTP code to user's email
 */
async function sendOTPEmail(email, otp, purpose = 'Email Verification', recipientName = '') {
  const mailer = await getTransporter();

  const purposeTitles = {
    'email_verification': 'Verify Your Email Address',
    'registration_approval': 'Complete Your Registration Verification',
    'login': 'Your Secure Login Verification Code',
    'password_reset': 'Reset Your Password'
  };

  const title = purposeTitles[purpose] || 'Security Verification Code';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4338ca; margin: 0; font-size: 24px; font-weight: 800;">PeoplePay360</h2>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Enterprise HR & Payroll Security</p>
      </div>
      <div style="padding: 20px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
        <h3 style="color: #1e293b; margin-top: 0;">${title}</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          Hello ${recipientName || 'there'},<br><br>
          Use the following verification code to complete your action. This code will expire in <strong>5 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #4338ca; background-color: #eef2ff; padding: 12px 28px; border-radius: 8px; border: 1px dashed #6366f1;">
            ${otp}
          </div>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
          If you did not request this verification code, please ignore this email or contact your administrator immediately.
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2026 PeoplePay360 Inc. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || '"PeoplePay360 Security" <security@peoplepay360.com>',
      to: email,
      subject: `[PeoplePay360] ${title}: ${otp}`,
      text: `Your PeoplePay360 verification code is: ${otp}. It expires in 5 minutes.`,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[OTP Email Preview]: ${previewUrl}`);
    }
    return { success: true, previewUrl: previewUrl || null };
  } catch (err) {
    console.error('Failed to send OTP email:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send notification email when registration request is approved or refused
 */
async function sendRegistrationStatusEmail(email, status, reason = '', recipientName = '') {
  const mailer = await getTransporter();

  const isApproved = status === 'approved';
  const subject = isApproved 
    ? '🎉 Welcome to PeoplePay360 — Your Registration is Approved'
    : 'Notice regarding your PeoplePay360 Registration Request';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4338ca; margin: 0; font-size: 24px; font-weight: 800;">PeoplePay360</h2>
      </div>
      <div style="padding: 20px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
        <h3 style="color: ${isApproved ? '#16a34a' : '#dc2626'}; margin-top: 0;">
          ${isApproved ? 'Registration Approved!' : 'Registration Request Declined'}
        </h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          Hello ${recipientName || 'there'},<br><br>
          ${isApproved 
            ? 'Your registration request has been reviewed and approved by your organization HR team. Your account is now active and you may log in to the portal.'
            : `Your registration request has been reviewed and was not approved at this time.<br><strong>Reason:</strong> ${reason || 'Not specified'}`
          }
        </p>
        ${isApproved ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="http://localhost:5173/login" style="background-color: #4f46e5; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Sign In to Your Account
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || '"PeoplePay360 Admin" <noreply@peoplepay360.com>',
      to: email,
      subject,
      text: isApproved 
        ? `Your registration is approved! You can now log in.` 
        : `Your registration request was declined: ${reason}`,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    return { success: true, previewUrl: previewUrl || null };
  } catch (err) {
    console.error('Failed to send registration status email:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getTransporter,
  sendPayrunPayslips,
  sendOTPEmail,
  sendRegistrationStatusEmail
};
