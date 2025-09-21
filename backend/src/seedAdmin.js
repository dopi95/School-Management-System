import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    // Check if superadmin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Create default superadmin
    const superAdmin = await Admin.create({
      name: 'Super Administrator',
      email: 'admin@bluelight.com',
      password: 'SuperAdmin123!',
      role: 'superadmin',
      permissions: {
        dashboard: true,
        students: true,
        inactiveStudents: true,
        employees: true,
        inactiveEmployees: true,
        payments: true,
        admins: true,
        profile: true,
        settings: true
      }
    });

    console.log('Super admin created successfully');
    console.log('Email: admin@bluelight.com');
    console.log('Password: SuperAdmin123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();