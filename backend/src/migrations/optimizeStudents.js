import mongoose from 'mongoose';
import Student from '../models/Student.js';

const optimizeStudents = async () => {
  try {
    console.log('Optimizing students collection...');
    
    // Ensure compound indexes exist
    await Student.collection.createIndex({ class: 1, section: 1, name: 1 });
    await Student.collection.createIndex({ status: 1, class: 1, section: 1 });
    
    console.log('✅ Students optimization completed');
  } catch (error) {
    console.error('❌ Error optimizing students:', error);
  }
};

export default optimizeStudents;