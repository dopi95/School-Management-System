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
      'SPECIAL_STUDENT_CREATE', 'SPECIAL_STUDENT_UPDATE', 'SPECIAL_STUDENT_DELETE', 'SPECIAL_STUDENT_STATUS_CHANGE',
      'SPECIAL_PAYMENT_CREATE', 'SPECIAL_PAYMENT_UPDATE', 'SPECIAL_PAYMENT_DELETE', 'SPECIAL_PAYMENT_MARKED_PAID',
      'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'EMPLOYEE_STATUS_CHANGE',
      'ADMIN_CREATE', 'ADMIN_UPDATE', 'ADMIN_DELETE',
      'PAYMENT_CREATE', 'PAYMENT_UPDATE', 'PAYMENT_DELETE',
      'NOTIFICATION_SEND',
      'CUSTOM_LIST_CREATED', 'CUSTOM_LIST_UPDATED', 'CUSTOM_LIST_DELETED',
      'PAYMENT_ADDED_TO_LIST', 'STUDENT_UPDATED_IN_LIST', 'STUDENT_REMOVED_FROM_LIST', 'STUDENTS_ADDED_TO_LIST'
    ]
  },
  targetType: {
    type: String,
    enum: ['Student', 'Employee', 'Admin', 'Payment', 'Profile', 'System', 'special_student', 'SpecialStudent', 'SpecialPayment', 'CustomPaymentList']
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