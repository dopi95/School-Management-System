import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipients: [{
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    parentPhone: { type: String, required: true }
  }],
  template: { type: String },
  sentBy: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);