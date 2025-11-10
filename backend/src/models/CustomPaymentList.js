import mongoose from 'mongoose';

const customPaymentListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  students: [{
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    class: { type: String },
    section: { type: String },
    amountPaid: { type: String },
    paymentType: { type: String, enum: ['cash', 'bank'] },
    paymentDate: { type: String },
    addedAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
customPaymentListSchema.index({ year: 1, createdAt: -1 });
customPaymentListSchema.index({ title: 1 });
customPaymentListSchema.index({ createdBy: 1 });

const CustomPaymentList = mongoose.model('CustomPaymentList', customPaymentListSchema);
export default CustomPaymentList;