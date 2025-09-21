import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now },
  description: { type: String },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'paid' }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);