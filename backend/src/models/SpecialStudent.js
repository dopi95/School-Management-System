import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: String, required: true },
  paid: { type: Boolean, default: false },
  date: { type: String },
  description: { type: String }
});

const specialStudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  dateOfBirth: { type: String },
  joinedYear: { type: String },
  address: { type: String },
  class: { type: String, required: true },
  section: { 
    type: String, 
    enum: ['A', 'B', 'C', 'D'],
    validate: {
      validator: function(v) {
        return !v || ['A', 'B', 'C', 'D'].includes(v);
      },
      message: 'Section must be A, B, C, or D'
    }
  },
  fatherName: { type: String },
  fatherPhone: { type: String },
  motherName: { type: String },
  motherPhone: { type: String },
  phone: { type: String },
  photo: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  payments: { type: Map, of: paymentSchema },
  isSpecial: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Pre-save middleware to handle empty section strings
specialStudentSchema.pre('save', function(next) {
  if (this.section === '') {
    this.section = undefined;
  }
  next();
});

export default mongoose.model('SpecialStudent', specialStudentSchema);