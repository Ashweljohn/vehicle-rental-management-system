/**
 * Role-based access control middleware.
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'BRANCH_STAFF')
 * Must run AFTER `authenticate` so req.user is populated.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errorCode: 'NOT_AUTHENTICATED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
        errorCode: 'FORBIDDEN',
      });
    }

    next();
  };
};

module.exports = authorize;
