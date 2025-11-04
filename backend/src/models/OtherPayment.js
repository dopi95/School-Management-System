import mongoose from 'mongoose';

const otherPaymentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentType: {
    type: String,
    required: true,
    enum: ['regular', 'special']
  },
  type: {
    type: String,
    required: true,
    enum: ['book', 'stationary']
  },
  year: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  paid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

otherPaymentSchema.index({ studentId: 1, type: 1, year: 1 }, { unique: true });

export default mongoose.model('OtherPayment', otherPaymentSchema);