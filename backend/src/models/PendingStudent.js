import mongoose from 'mongoose';

const pendingStudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  middleName: { type: String, required: true },
  lastName: { type: String, required: true },
  firstNameAm: { type: String },
  middleNameAm: { type: String },
  lastNameAm: { type: String },
  gender: { type: String, required: true, enum: ['male', 'female'] },
  email: { type: String },
  dateOfBirth: { type: String, required: true },
  joinedYear: { type: String, required: true },
  address: { type: String, required: true },
  class: { type: String, required: true },
  fatherName: { type: String, required: true },
  fatherPhone: { type: String, required: true },
  motherName: { type: String, required: true },
  motherPhone: { type: String, required: true },
  photo: { type: String },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'], index: true }
}, {
  timestamps: true
});

// Add indexes for better query performance
pendingStudentSchema.index({ status: 1, createdAt: -1 });
pendingStudentSchema.index({ id: 1 }, { unique: true });
pendingStudentSchema.index({ createdAt: -1 });
pendingStudentSchema.index({ class: 1 });
pendingStudentSchema.index({ fatherPhone: 1 });
pendingStudentSchema.index({ firstName: 1, middleName: 1, lastName: 1 });
// Compound index for the main query
pendingStudentSchema.index({ status: 1, createdAt: -1, id: 1 });

const PendingStudent = mongoose.model('PendingStudent', pendingStudentSchema);
export default PendingStudent;