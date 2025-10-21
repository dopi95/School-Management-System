import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  qualificationLevel: { type: String },
  experience: { type: String },
  address: { type: String },
  sex: { type: String, enum: ['Male', 'Female'], required: true },
  employmentDate: { type: String, required: true },
  employmentType: { type: String, enum: ['parttime', 'fulltime'], required: true },
  salaryByYear: [{
    year: { type: String, required: true },
    monthlySalary: { type: Number, required: true }
  }],
  teachingSubjects: [{ type: String }],
  teachingGradeLevel: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  
  // Legacy fields for backward compatibility
  name: { type: String },
  email: { type: String },
  position: { type: String },
  department: { type: String },
  salary: { type: Number },
  joinedDate: { type: String },
  photo: { type: String },
  classes: [{ type: String }],
  qualification: { type: String }
}, {
  timestamps: true
});

// Virtual for backward compatibility
employeeSchema.virtual('displayName').get(function() {
  return this.fullName || this.name;
});

employeeSchema.virtual('displayRole').get(function() {
  return this.role || this.position;
});

export default mongoose.model('Employee', employeeSchema);