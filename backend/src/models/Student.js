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
  originalPendingId: { type: String },
  name: { type: String, required: true }, // Keep for backward compatibility
  firstName: { type: String, required: true },
  middleName: { type: String, required: true },
  lastName: { type: String, required: true },
  firstNameAm: { type: String },
  middleNameAm: { type: String },
  lastNameAm: { type: String },
  paymentCode: { type: String },
  gender: { type: String, enum: ['male', 'female'], required: true },
  email: { type: String },
  dateOfBirth: { type: String },
  joinedYear: { type: String },
  address: { type: String },
  class: { type: String, required: true },
  section: { 
    type: String, 
    enum: ['A', 'B', 'C', 'D'],
    required: false
  },
  fatherName: { type: String },
  fatherPhone: { type: String },
  motherName: { type: String },
  motherPhone: { type: String },
  phone: { type: String },
  photo: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  payments: { type: Map, of: paymentSchema },
  otherPayments: { type: Map, of: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Pre-save middleware to handle empty section strings
studentSchema.pre('save', function(next) {
  if (this.section === '' || this.section === null) {
    this.section = undefined;
  }
  next();
});

// Pre-validate middleware to handle empty strings before validation
studentSchema.pre('validate', function(next) {
  if (this.section === '' || this.section === null) {
    this.section = undefined;
  }
  next();
});

// Add indexes for better query performance
studentSchema.index({ id: 1 }, { unique: true });
studentSchema.index({ status: 1 });
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ name: 1 });
studentSchema.index({ firstName: 1, middleName: 1, lastName: 1 });
studentSchema.index({ fatherPhone: 1 });
studentSchema.index({ motherPhone: 1 });
studentSchema.index({ joinedYear: 1 });
// Compound index for main query
studentSchema.index({ class: 1, section: 1, name: 1 });
studentSchema.index({ status: 1, class: 1, section: 1 });

export default mongoose.model('Student', studentSchema);