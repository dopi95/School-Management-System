import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

dotenv.config();

const fixLogin = async () => {
  try {
    await connectDB();

    // Delete existing superadmin and create fresh one
    await Admin.deleteOne({ email: 'admin@bluelight.com' });
    
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

    console.log('Fresh SuperAdmin created successfully');
    console.log('Email: admin@bluelight.com');
    console.log('Password: SuperAdmin123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing login:', error);
    process.exit(1);
  }
};

fixLogin();