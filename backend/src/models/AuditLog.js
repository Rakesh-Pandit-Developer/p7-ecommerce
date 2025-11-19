const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'create',
        'update',
        'delete',
        'login',
        'logout',
        'export',
        'import',
        'settings_change',
        'order_status_change',
        'payment_verification',
      ],
      index: true,
    },
    resource: {
      type: String,
      required: true,
      enum: ['product', 'category', 'order', 'user', 'review', 'settings', 'auth'],
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      ip: String,
      userAgent: String,
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
