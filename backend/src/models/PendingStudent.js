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
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] }
}, {
  timestamps: true
});

export default mongoose.model('PendingStudent', pendingStudentSchema);