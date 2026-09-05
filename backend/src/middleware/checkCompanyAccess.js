/**
 * Company Access Middleware
 * Ensures every data query is scoped to the user's company.
 * Attaches req.companyId for use in controllers.
 */

const checkCompanyAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (!req.user.company_id) {
    return res.status(403).json({ error: 'No company associated with your account.' });
  }

  // Attach company_id for controllers to use in queries
  req.companyId = req.user.company_id;
  next();
};

module.exports = { checkCompanyAccess };
