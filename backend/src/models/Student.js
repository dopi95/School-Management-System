import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: String, required: true },
  paid: { type: Boolean, default: false },
  date: { type: String },
  description: { type: String }
});

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  dateOfBirth: { type: String },
  joinedYear: { type: String },
  address: { type: String },
  class: { type: String, required: true },
  fatherName: { type: String },
  fatherPhone: { type: String },
  motherName: { type: String },
  motherPhone: { type: String },
  phone: { type: String },
  photo: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  payments: { type: Map, of: paymentSchema }
}, {
  timestamps: true
});

export default mongoose.model('Student', studentSchema);