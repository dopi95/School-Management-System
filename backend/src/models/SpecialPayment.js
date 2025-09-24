import mongoose from 'mongoose';

const specialPaymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  description: { type: String },
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('SpecialPayment', specialPaymentSchema);