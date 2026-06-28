const AuditLog = require('../models/AuditLog');

/**
 * Audit logger middleware factory.
 *
 * Usage:
 *   router.put('/route', auth, auditLog('SELLER_APPROVED', 'Seller'), handler)
 *
 * It hooks into the response 'finish' event and only logs when statusCode < 400.
 * The target entity ID is taken from req.params.id (or req.body.targetId as fallback).
 */
function auditLog(action, targetType) {
  return async function (req, res, next) {
    res.on('finish', async () => {
      // Only log successful operations
      if (res.statusCode >= 400) return;

      try {
        const admin = req.admin || {};
        const targetId =
          req.params.id ||
          req.params.orderId ||
          req.params.batchId ||
          (req.body && req.body.targetId) ||
          '';

        await AuditLog.create({
          adminId: admin.id || null,
          adminName: admin.name || '',
          adminRole: admin.role || '',
          action,
          targetType,
          targetId: String(targetId),
          beforeValue: req._auditBefore || null,
          afterValue: req._auditAfter || null,
          ipAddress:
            req.ip ||
            (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
            '',
        });
      } catch (err) {
        // Audit log failures must not crash the request
        console.error('AuditLog error:', err.message);
      }
    });

    next();
  };
}

module.exports = { auditLog };
