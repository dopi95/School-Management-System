import mongoose from 'mongoose';

const adminActivityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    enum: ['profile_update', 'password_change'],
    required: true
  },
  changes: {
    type: Object,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

export default mongoose.model('AdminActivityLog', adminActivityLogSchema);