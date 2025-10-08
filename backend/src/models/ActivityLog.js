import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'PASSWORD_CHANGE',
      'STUDENT_CREATE', 'STUDENT_UPDATE', 'STUDENT_DELETE', 'STUDENT_STATUS_CHANGE', 'STUDENT_PAYMENT_UPDATE',
      'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'EMPLOYEE_STATUS_CHANGE',
      'ADMIN_CREATE', 'ADMIN_UPDATE', 'ADMIN_DELETE',
      'PAYMENT_CREATE', 'PAYMENT_UPDATE', 'PAYMENT_DELETE',
      'NOTIFICATION_SEND'
    ]
  },
  targetType: {
    type: String,
    enum: ['Student', 'Employee', 'Admin', 'Payment', 'Profile', 'System']
  },
  targetId: {
    type: String
  },
  targetName: {
    type: String
  },
  details: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

activityLogSchema.index({ adminId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);