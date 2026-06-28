/**
 * Role-Based Access Control middleware factory.
 *
 * Usage:
 *   router.put('/route', auth, allowRoles('super_admin', 'finance_admin'), handler)
 *
 * super_admin always passes through regardless of what roles are specified.
 */
function allowRoles(...roles) {
  return function (req, res, next) {
    if (!req.admin) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated.' });
    }

    const { role } = req.admin;

    // super_admin bypasses all role checks
    if (role === 'super_admin') {
      return next();
    }

    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = { allowRoles };
