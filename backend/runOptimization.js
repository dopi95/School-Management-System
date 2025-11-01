import mongoose from 'mongoose';
import dotenv from 'dotenv';
import optimizePendingStudents from './src/migrations/optimizePendingStudents.js';
import optimizeStudents from './src/migrations/optimizeStudents.js';

dotenv.config();

const runOptimization = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await optimizePendingStudents();
    await optimizeStudents();
    
    console.log('All optimizations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Optimization failed:', error);
    process.exit(1);
  }
};

runOptimization();