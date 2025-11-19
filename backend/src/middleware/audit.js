const AuditLog = require('../models/AuditLog');

// Create audit log entry
const logAction = async (req, action, resource, resourceId = null, changes = null, description = null) => {
  try {
    if (!req.user) return;

    await AuditLog.create({
      user: req.user._id,
      action,
      resource,
      resourceId,
      changes,
      metadata: {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
      },
      description,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

// Middleware to automatically log actions
const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function (data) {
      // Log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const resourceId = req.params.id || data?.data?._id || data?._id;
        const changes = req.body;
        
        logAction(req, action, resource, resourceId, changes).catch(console.error);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = { logAction, auditMiddleware };
