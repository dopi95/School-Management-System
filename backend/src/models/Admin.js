import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['superadmin', 'admin', 'manager'], 
    default: 'admin' 
  },
  permissions: {
    dashboard: { type: Boolean, default: true },
    students: { type: Boolean, default: false },
    inactiveStudents: { type: Boolean, default: false },
    employees: { type: Boolean, default: false },
    inactiveEmployees: { type: Boolean, default: false },
    payments: { type: Boolean, default: false },
    admins: { type: Boolean, default: false },
    profile: { type: Boolean, default: true },
    settings: { type: Boolean, default: false }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  lastLogin: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('Admin', adminSchema);