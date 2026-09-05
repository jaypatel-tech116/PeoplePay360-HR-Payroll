/**
 * Record Ownership Middleware
 * Prevents IDOR attacks by verifying the authenticated user's employee_id
 * matches the target record's employee_id for Employee-role users.
 * 
 * For HR+ roles, ownership checks are bypassed (they have read_all permissions).
 * 
 * Usage:
 *   checkRecordOwnership('employees')   — checks req.params.id against req.user.employee_id
 *   checkRecordOwnership('attendance')  — queries the attendance record's employee_id
 */
const { query } = require('../config/db');
const { hasPermission } = require('./authorizePermission');

/**
 * Table-to-column mappings for ownership lookups.
 * Maps a resource type to the table and column used to find the owning employee_id.
 */
const OWNERSHIP_MAP = {
  employees: {
    // For employees, the record ID IS the employee_id
    directMatch: true
  },
  attendances: {
    table: 'attendances',
    column: 'employee_id'
  },
  time_off_requests: {
    table: 'time_off_requests',
    column: 'employee_id'
  },
  time_off_allocations: {
    table: 'time_off_allocations',
    column: 'employee_id'
  },
  payslips: {
    table: 'payslips',
    column: 'employee_id'
  },
  contracts: {
    table: 'contracts',
    column: 'employee_id'
  }
};

const checkRecordOwnership = (resourceType, readAllModule = null) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const recordId = parseInt(req.params.id, 10);
    if (isNaN(recordId) || recordId <= 0) {
      return res.status(400).json({ error: 'Invalid record ID.' });
    }

    // If the user has read_all permission for this module, skip ownership check
    if (readAllModule) {
      try {
        const canReadAll = await hasPermission(req.user.role, readAllModule, 'read_all');
        if (canReadAll) {
          return next();
        }
      } catch (err) {
        // Fall through to ownership check
      }
    }

    // For users without read_all, enforce ownership
    const userEmployeeId = req.user.employee_id;
    if (!userEmployeeId) {
      return res.status(403).json({ 
        error: 'No employee record linked to your account. Cannot verify ownership.' 
      });
    }

    const ownershipConfig = OWNERSHIP_MAP[resourceType];
    if (!ownershipConfig) {
      // Unknown resource type, deny by default
      return res.status(403).json({ error: 'Access denied. Unknown resource type.' });
    }

    try {
      if (ownershipConfig.directMatch) {
        // For employees table, the param ID must match the user's employee_id
        if (recordId !== userEmployeeId) {
          return res.status(403).json({ 
            error: 'Access denied. You can only access your own records.' 
          });
        }
        return next();
      }

      // For other tables, look up the employee_id of the record
      const result = await query(
        `SELECT ${ownershipConfig.column} FROM ${ownershipConfig.table} WHERE id = $1`,
        [recordId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Record not found.' });
      }

      const recordEmployeeId = result.rows[0][ownershipConfig.column];
      if (recordEmployeeId !== userEmployeeId) {
        return res.status(403).json({ 
          error: 'Access denied. You can only access your own records.' 
        });
      }

      next();
    } catch (err) {
      console.error('Ownership check error:', err);
      return res.status(500).json({ error: 'Internal error during authorization.' });
    }
  };
};

module.exports = { checkRecordOwnership };
