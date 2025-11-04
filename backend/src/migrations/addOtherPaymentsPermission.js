import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

const addOtherPaymentsPermission = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all existing admins to include the new otherPayments permission
    const result = await Admin.updateMany(
      {},
      {
        $set: {
          'permissions.otherPayments': false
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} admin records with otherPayments permission`);
    
    mongoose.connection.close();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addOtherPaymentsPermission();