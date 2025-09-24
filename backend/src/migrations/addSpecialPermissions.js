import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

const addSpecialPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all existing admins to include the new permissions
    const result = await Admin.updateMany(
      {},
      {
        $set: {
          'permissions.specialStudents': false,
          'permissions.specialPayments': false
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} admin records with new permissions`);
    
    mongoose.connection.close();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addSpecialPermissions();