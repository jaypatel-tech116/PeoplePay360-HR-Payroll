/**
 * Registration Controller
 * Manages employee self-registration with email OTP verification and HR/Admin approval.
 */
const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/db');
const { createOTP, verifyOTP } = require('../services/otpService');
const { sendOTPEmail, sendRegistrationStatusEmail } = require('../services/emailService');
const { createAuditLog } = require('../services/auditService');

/**
 * Step 1: Submit self-registration request
 */
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password, company_id, department_id, job_position_id } = req.body;

    if (!full_name || !email || !password || !company_id) {
      return res.status(400).json({ error: 'Full name, email, password, and company are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if an active user already exists with this email
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    // Verify company exists
    const companyRes = await query('SELECT id, name FROM companies WHERE id = $1 AND is_active = true', [company_id]);
    if (companyRes.rows.length === 0) {
      return res.status(400).json({ error: 'The selected company is invalid or inactive.' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if there is already a pending request for this email
    const existingReq = await query(
      `SELECT id, status, email_verified FROM registration_requests WHERE email = $1 AND status IN ('pending', 'email_verification')`,
      [normalizedEmail]
    );

    let requestId;
    if (existingReq.rows.length > 0) {
      requestId = existingReq.rows[0].id;
      // Update existing request with fresh credentials and company
      await query(
        `UPDATE registration_requests
         SET full_name = $1, phone = $2, password_hash = $3, company_id = $4,
             department_id = $5, job_position_id = $6, status = 'email_verification',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7`,
        [full_name, phone || null, passwordHash, company_id, department_id || null, job_position_id || null, requestId]
      );
    } else {
      const insertRes = await query(
        `INSERT INTO registration_requests
          (full_name, email, phone, password_hash, company_id, department_id, job_position_id, status, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'email_verification', false)
         RETURNING id`,
        [full_name, normalizedEmail, phone || null, passwordHash, company_id, department_id || null, job_position_id || null]
      );
      requestId = insertRes.rows[0].id;
    }

    // Generate and send OTP
    const { otp, expiresAt } = await createOTP(normalizedEmail, 'email_verification', requestId);
    await sendOTPEmail(normalizedEmail, otp, 'email_verification', full_name);

    res.status(201).json({
      message: 'Registration request submitted. A 6-digit verification code has been sent to your email.',
      requestId,
      email: normalizedEmail,
      expiresAt
    });
  } catch (err) {
    console.error('Registration submit error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Error processing registration.' });
  }
};

/**
 * Step 2: Verify email via OTP
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and verification code (OTP) are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const verification = await verifyOTP(normalizedEmail, otp, 'email_verification');

    // Update registration request status to pending approval
    const result = await query(
      `UPDATE registration_requests
       SET email_verified = true,
           status = 'pending',
           updated_at = CURRENT_TIMESTAMP
       WHERE email = $1 AND status = 'email_verification'
       RETURNING id, full_name, email, status`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      // Check if already pending or approved
      const checkRes = await query('SELECT status FROM registration_requests WHERE email = $1', [normalizedEmail]);
      if (checkRes.rows.length > 0 && checkRes.rows[0].status === 'pending') {
        return res.json({
          message: 'Email is already verified. Your request is currently awaiting HR approval.',
          status: 'pending'
        });
      }
    }

    res.json({
      message: 'Email successfully verified! Your registration request has been forwarded to HR for approval.',
      status: 'pending'
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(err.status || 400).json({ error: err.message || 'OTP verification failed.' });
  }
};

/**
 * Step 3: Resend OTP
 */
exports.resendOTP = async (req, res) => {
  try {
    const { email, purpose = 'email_verification' } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to resend OTP.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find registration record
    const reqRes = await query(
      'SELECT id, full_name FROM registration_requests WHERE email = $1',
      [normalizedEmail]
    );

    const fullName = reqRes.rows[0]?.full_name || '';
    const referenceId = reqRes.rows[0]?.id || null;

    const { otp, expiresAt, resendsRemaining } = await createOTP(normalizedEmail, purpose, referenceId);
    await sendOTPEmail(normalizedEmail, otp, purpose, fullName);

    res.json({
      message: `A new verification code has been dispatched. (${resendsRemaining} resends left)`,
      expiresAt,
      resendsRemaining
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to resend verification code.' });
  }
};

/**
 * List all registration requests (Admin / HR view)
 */
exports.listRequests = async (req, res) => {
  try {
    const { status, companyId } = req.query;
    let sql = `
      SELECT r.*, c.name AS company_name, d.name AS department_name, j.title AS job_title,
             u.name AS reviewer_name
      FROM registration_requests r
      JOIN companies c ON r.company_id = c.id
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN job_positions j ON r.job_position_id = j.id
      LEFT JOIN users u ON r.decided_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    // Company scoping: non-admins only see requests from their company
    if (req.user.role !== 'Admin') {
      sql += ` AND r.company_id = $${idx++}`;
      params.push(req.user.company_id);
    } else if (companyId) {
      sql += ` AND r.company_id = $${idx++}`;
      params.push(companyId);
    }

    if (status) {
      sql += ` AND r.status = $${idx++}`;
      params.push(status);
    }

    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('List registration requests error:', err);
    res.status(500).json({ error: 'Failed to retrieve registration requests.' });
  }
};

/**
 * Approve registration request (creates Employee + User account)
 */
exports.approveRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Fetch request
    const reqRes = await client.query(
      `SELECT * FROM registration_requests WHERE id = $1`,
      [id]
    );

    if (reqRes.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Registration request not found.' });
    }

    const registration = reqRes.rows[0];

    // Company boundary check
    if (req.user.role !== 'Admin' && registration.company_id !== req.user.company_id) {
      client.release();
      return res.status(403).json({ error: 'Forbidden. You can only review registrations in your assigned company.' });
    }

    if (registration.status === 'approved') {
      client.release();
      return res.status(400).json({ error: 'This registration request has already been approved.' });
    }

    if (!registration.email_verified) {
      client.release();
      return res.status(400).json({ error: 'Cannot approve request: The applicant has not verified their email address.' });
    }

    await client.query('BEGIN');

    // 1. Get role ID for 'Employee'
    const roleRes = await client.query(`SELECT id FROM roles WHERE name = 'Employee'`);
    const employeeRoleId = roleRes.rows[0].id;

    // 2. Get default working schedule if not provided
    const schedRes = await client.query(`SELECT id FROM working_schedules ORDER BY id ASC LIMIT 1`);
    const defaultScheduleId = schedRes.rows[0]?.id || 1;

    // 3. Create Employee record
    const empInsert = await client.query(
      `INSERT INTO employees (
         full_name, email, phone,
         company_id, department_id, job_position_id, working_schedule_id,
         status, employee_type, hire_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', 'full_time', CURRENT_DATE)
       RETURNING id`,
      [
        registration.full_name,
        registration.email,
        registration.phone,
        registration.company_id,
        registration.department_id,
        registration.job_position_id,
        defaultScheduleId
      ]
    );
    const newEmployeeId = empInsert.rows[0].id;

    // 3. Create User record
    const userInsert = await client.query(
      `INSERT INTO users (
         name, email, password_hash, role_id, company_id, employee_id, is_active, email_verified
       ) VALUES ($1, $2, $3, $4, $5, $6, true, true)
       RETURNING id`,
      [
        registration.full_name,
        registration.email,
        registration.password_hash,
        employeeRoleId,
        registration.company_id,
        newEmployeeId
      ]
    );
    const newUserId = userInsert.rows[0].id;

    // 4. Mark registration as approved
    await client.query(
      `UPDATE registration_requests
       SET status = 'approved',
           decided_by = $1,
           decided_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [req.user.id, id]
    );

    // 5. Audit Log
    await client.query(
      `INSERT INTO audit_logs (user_id, company_id, action, table_name, record_id, new_values, ip_address)
       VALUES ($1, $2, 'registration_approved', 'registration_requests', $3, $4, $5)`,
      [
        req.user.id,
        registration.company_id,
        id,
        JSON.stringify({ approved_user_id: newUserId, approved_employee_id: newEmployeeId }),
        req.ip
      ]
    );

    await client.query('COMMIT');
    client.release();

    // Send confirmation email to applicant asynchronously
    sendRegistrationStatusEmail(registration.email, 'approved', '', registration.full_name);

    res.json({
      message: 'Registration request approved. Employee record and user account have been created successfully.',
      userId: newUserId,
      employeeId: newEmployeeId
    });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Approve registration error:', err);
    res.status(500).json({ error: 'Failed to approve registration request.' });
  }
};

/**
 * Refuse registration request
 */
exports.refuseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const reqRes = await query('SELECT * FROM registration_requests WHERE id = $1', [id]);
    if (reqRes.rows.length === 0) {
      return res.status(404).json({ error: 'Registration request not found.' });
    }

    const registration = reqRes.rows[0];

    if (req.user.role !== 'Admin' && registration.company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Forbidden. You can only review registrations in your assigned company.' });
    }

    await query(
      `UPDATE registration_requests
       SET status = 'refused',
           refusal_reason = $1,
           decided_by = $2,
           decided_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [reason || 'Application declined by administrator', req.user.id, id]
    );

    await createAuditLog({
      userId: req.user.id,
      companyId: registration.company_id,
      action: 'registration_refused',
      tableName: 'registration_requests',
      recordId: id,
      newValues: { reason },
      ipAddress: req.ip
    });

    // Send rejection email
    sendRegistrationStatusEmail(registration.email, 'refused', reason, registration.full_name);

    res.json({ message: 'Registration request has been refused.' });
  } catch (err) {
    console.error('Refuse registration error:', err);
    res.status(500).json({ error: 'Failed to refuse registration request.' });
  }
};
