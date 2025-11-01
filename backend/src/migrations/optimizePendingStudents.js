import mongoose from 'mongoose';
import PendingStudent from '../models/PendingStudent.js';

const optimizePendingStudents = async () => {
  try {
    console.log('Optimizing pending students collection...');
    
    // Ensure indexes exist
    await PendingStudent.collection.createIndex({ status: 1, createdAt: -1, id: 1 });
    
    console.log('✅ Pending students optimization completed');
  } catch (error) {
    console.error('❌ Error optimizing pending students:', error);
  }
};

export default optimizePendingStudents;