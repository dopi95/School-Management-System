import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  position: { type: String, required: true },
  department: { type: String },
  salary: { type: Number },
  joinedDate: { type: String },
  address: { type: String },
  photo: { type: String },
  classes: [{ type: String }],
  qualification: { type: String },
  experience: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

export default mongoose.model('Employee', employeeSchema);