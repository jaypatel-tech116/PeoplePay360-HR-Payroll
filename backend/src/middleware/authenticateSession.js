/**
 * Session Authentication Middleware
 * Reads the session token from the HttpOnly cookie, validates it against the
 * user_sessions table, and populates req.user with the authenticated user.
 * 
 * Also supports legacy Bearer token auth during the transition period.
 */
const { validateSession } = require('../services/sessionService');

const COOKIE_NAME = 'ppay360_session';

const authenticateSession = async (req, res, next) => {
  // 1. Try to get token from HttpOnly cookie first (secure path)
  let sessionToken = req.cookies?.[COOKIE_NAME];

  // 2. Also check Authorization header
  if (!sessionToken) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const candidate = authHeader.split(' ')[1];
      // Check if it is a valid session token first
      const sessionUser = await validateSession(candidate);
      if (sessionUser) {
        req.user = sessionUser;
        req.sessionToken = candidate;
        return next();
      }

      // During transition, try legacy JWT fallback
      const jwt = require('jsonwebtoken');
      const { query } = require('../config/db');
      const JWT_SECRET = process.env.JWT_SECRET || 'peoplepay360_secure_jwt_token_secret_2026_odoo';
      try {
        const decoded = jwt.verify(candidate, JWT_SECRET);
        const userRes = await query(
          `SELECT u.id, u.name, u.email, u.avatar_url, u.employee_id, u.is_active, u.company_id, u.email_verified, r.name AS role
           FROM users u
           JOIN roles r ON u.role_id = r.id
           WHERE u.id = $1`,
          [decoded.id]
        );

        if (userRes.rows.length > 0 && userRes.rows[0].is_active) {
          req.user = userRes.rows[0];
          return next();
        }
      } catch (e) {
        // JWT invalid, fall through
      }
    }
  }

  if (!sessionToken) {
    return res.status(401).json({ error: 'Access denied. No valid session.' });
  }

  try {
    const user = await validateSession(sessionToken);
    if (!user) {
      // Clear the invalid cookie
      res.clearCookie(COOKIE_NAME, { httpOnly: true, path: '/' });
      return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Session authentication error:', err);
    return res.status(500).json({ error: 'Internal authentication error.' });
  }
};

module.exports = { authenticateSession, COOKIE_NAME };
