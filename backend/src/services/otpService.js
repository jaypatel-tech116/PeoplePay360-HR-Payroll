/**
 * OTP Service
 * Manages cryptographically secure One-Time Passwords with purpose-binding,
 * hashing, 5-minute expiry, attempt limits, and resend limits.
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;

/**
 * Generate a cryptographically random 6-digit numeric OTP
 */
function generateNumericOTP() {
  // Use crypto.randomInt for uniform distribution
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Create and store an OTP for a specific email and purpose.
 * Inactivates any previously active OTPs for the same email and purpose.
 * 
 * @param {string} email
 * @param {string} purpose - 'registration_approval' | 'email_verification' | 'login' | 'password_reset'
 * @param {number} [referenceId] - e.g. registration_requests.id or user.id
 * @returns {Promise<{ otp: string, expiresAt: Date }>}
 */
async function createOTP(email, purpose, referenceId = null) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check existing active OTP to check resend limits
  const existingRes = await query(
    `SELECT id, resend_count, created_at 
     FROM otp_verifications
     WHERE target_email = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
     ORDER BY created_at DESC LIMIT 1`,
    [normalizedEmail, purpose]
  );

  let resendCount = 0;
  if (existingRes.rows.length > 0) {
    resendCount = existingRes.rows[0].resend_count + 1;
    if (resendCount > MAX_RESENDS) {
      const err = new Error(`Too many OTP requests. Maximum resends reached. Please try again after 15 minutes.`);
      err.status = 429;
      throw err;
    }
  }

  // Generate plain 6-digit OTP
  const rawOtp = generateNumericOTP();
  const otpHash = await bcrypt.hash(rawOtp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Mark all old OTPs for this target + purpose as expired/used
  await query(
    `UPDATE otp_verifications 
     SET used_at = CURRENT_TIMESTAMP 
     WHERE target_email = $1 AND purpose = $2 AND used_at IS NULL`,
    [normalizedEmail, purpose]
  );

  // Insert new OTP record
  await query(
    `INSERT INTO otp_verifications 
      (target_email, otp_hash, purpose, reference_id, expires_at, attempts, max_attempts, resend_count, max_resends)
     VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8)`,
    [normalizedEmail, otpHash, purpose, referenceId, expiresAt, MAX_ATTEMPTS, resendCount, MAX_RESENDS]
  );

  return { otp: rawOtp, expiresAt, resendsRemaining: MAX_RESENDS - resendCount };
}

/**
 * Verify an OTP.
 * 
 * @param {string} email
 * @param {string} otp
 * @param {string} purpose
 * @returns {Promise<{ valid: boolean, referenceId?: number }>}
 */
async function verifyOTP(email, otp, purpose) {
  const normalizedEmail = email.toLowerCase().trim();

  const result = await query(
    `SELECT id, otp_hash, reference_id, expires_at, attempts, max_attempts, used_at
     FROM otp_verifications
     WHERE target_email = $1 AND purpose = $2 AND used_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [normalizedEmail, purpose]
  );

  if (result.rows.length === 0) {
    const err = new Error('No active OTP found for this email and purpose. Please request a new code.');
    err.status = 400;
    throw err;
  }

  const record = result.rows[0];

  // Check attempt limit
  if (record.attempts >= record.max_attempts) {
    const err = new Error('Too many failed attempts. This OTP is now locked. Please request a new code.');
    err.status = 429;
    throw err;
  }

  // Check expiry
  if (new Date(record.expires_at) < new Date()) {
    const err = new Error('OTP has expired. Codes are only valid for 5 minutes. Please request a new one.');
    err.status = 400;
    throw err;
  }

  // Validate OTP code
  const isMatch = await bcrypt.compare(otp.trim(), record.otp_hash);
  if (!isMatch) {
    // Increment attempts
    await query(
      `UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1`,
      [record.id]
    );
    const attemptsLeft = record.max_attempts - (record.attempts + 1);
    const err = new Error(`Invalid OTP. ${attemptsLeft} attempt(s) remaining.`);
    err.status = 400;
    throw err;
  }

  // Mark as used
  await query(
    `UPDATE otp_verifications SET used_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [record.id]
  );

  return {
    valid: true,
    referenceId: record.reference_id
  };
}

module.exports = {
  createOTP,
  verifyOTP,
  OTP_EXPIRY_MINUTES,
  MAX_RESENDS
};
