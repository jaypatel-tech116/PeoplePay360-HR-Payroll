/**
 * Role & Permission Middleware
 * Enforces server-side permissions according to Section 4 of the specification.
 */

const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const userRole = req.user.role;
    if (allowedRoles.includes(userRole) || userRole === 'Admin') {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden: Your role (${userRole}) does not have permission to perform this action.`,
      requiredRoles: allowedRoles
    });
  };
};

module.exports = { requireRoles };
