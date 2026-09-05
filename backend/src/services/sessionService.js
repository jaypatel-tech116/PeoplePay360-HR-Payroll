/**
 * Session Service
 * Manages database-backed user sessions with secure token hashing.
 * Replaces JWT-based stateless authentication with server-side session control.
 */
const crypto = require('crypto');
const { query } = require('../config/db');

const SESSION_DURATION_DAYS = 7;

/**
 * Hash a session token using SHA-256
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a cryptographically secure random session token
 */
function generateSessionToken() {
  return crypto.randomBytes(48).toString('hex');
}

/**
 * Create a new session for a user.
 * Returns the raw (unhashed) token to be set as a cookie.
 */
async function createSession(userId, ipAddress, userAgent) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO user_sessions (user_id, session_token_hash, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, ipAddress || null, userAgent || null, expiresAt]
  );

  return { token, expiresAt };
}

/**
 * Validate a session token. Returns the full user object if valid, null otherwise.
 */
async function validateSession(token) {
  if (!token) return null;

  const tokenHash = hashToken(token);

  const result = await query(
    `SELECT s.id AS session_id, s.expires_at, s.revoked_at,
            u.id, u.name, u.email, u.avatar_url, u.employee_id, u.is_active, u.company_id, u.email_verified,
            r.name AS role
     FROM user_sessions s
     JOIN users u ON s.user_id = u.id
     JOIN roles r ON u.role_id = r.id
     WHERE s.session_token_hash = $1`,
    [tokenHash]
  );

  if (result.rows.length === 0) return null;

  const session = result.rows[0];

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) return null;

  // Check if session is revoked
  if (session.revoked_at) return null;

  // Check if user is active
  if (!session.is_active) return null;

  return {
    sessionId: session.session_id,
    id: session.id,
    name: session.name,
    email: session.email,
    avatar_url: session.avatar_url,
    employee_id: session.employee_id,
    is_active: session.is_active,
    company_id: session.company_id,
    email_verified: session.email_verified,
    role: session.role
  };
}

/**
 * Revoke a specific session (logout)
 */
async function revokeSession(token) {
  if (!token) return;
  const tokenHash = hashToken(token);
  await query(
    `UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE session_token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash]
  );
}

/**
 * Revoke all sessions for a user (logout everywhere)
 */
async function revokeAllUserSessions(userId) {
  await query(
    `UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

/**
 * Clean up expired sessions (can be called periodically)
 */
async function cleanupExpiredSessions() {
  const result = await query(
    `DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP OR revoked_at IS NOT NULL RETURNING id`
  );
  return result.rowCount;
}

module.exports = {
  createSession,
  validateSession,
  revokeSession,
  revokeAllUserSessions,
  cleanupExpiredSessions,
  SESSION_DURATION_DAYS
};
