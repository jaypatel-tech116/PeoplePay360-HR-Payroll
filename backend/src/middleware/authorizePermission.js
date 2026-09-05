/**
 * Permission Authorization Middleware
 * Checks the role_permissions table to verify the user's role has the
 * required module+action permission.
 * 
 * Usage: authorizePermission('employees', 'read_all')
 */
const { query } = require('../config/db');

// In-memory cache for role permissions (refreshed every 5 minutes)
let permissionCache = {};
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadPermissions() {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL && Object.keys(permissionCache).length > 0) {
    return permissionCache;
  }

  const result = await query(
    `SELECT r.name AS role, rp.module, rp.action
     FROM role_permissions rp
     JOIN roles r ON rp.role_id = r.id
     ORDER BY r.name`
  );

  const cache = {};
  for (const row of result.rows) {
    if (!cache[row.role]) cache[row.role] = new Set();
    cache[row.role].add(`${row.module}:${row.action}`);
  }

  permissionCache = cache;
  cacheTimestamp = now;
  return cache;
}

/**
 * Check if a role has a specific permission.
 * @param {string} role - The user's role name (e.g. 'HR Manager')
 * @param {string} module - The module name (e.g. 'employees')
 * @param {string} action - The action name (e.g. 'read_all')
 * @returns {boolean}
 */
async function hasPermission(role, module, action) {
  const perms = await loadPermissions();
  const rolePerms = perms[role];
  if (!rolePerms) return false;
  return rolePerms.has(`${module}:${action}`);
}

/**
 * Express middleware factory.
 * Returns 403 if the user doesn't have the required permission.
 */
const authorizePermission = (module, action) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    try {
      const allowed = await hasPermission(req.user.role, module, action);
      if (!allowed) {
        return res.status(403).json({
          error: `Forbidden: Your role (${req.user.role}) does not have permission [${module}:${action}].`,
          requiredPermission: `${module}:${action}`
        });
      }

      next();
    } catch (err) {
      console.error('Authorization error:', err);
      return res.status(500).json({ error: 'Internal authorization error.' });
    }
  };
};

/**
 * Invalidate the permission cache (call when permissions are updated)
 */
function invalidatePermissionCache() {
  permissionCache = {};
  cacheTimestamp = 0;
}

module.exports = { authorizePermission, hasPermission, invalidatePermissionCache };
