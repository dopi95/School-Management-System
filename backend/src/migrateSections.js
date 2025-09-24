import Student from './models/Student.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateSections = async () => {
  try {
    await connectDB();
    
    // Get all students without sections
    const students = await Student.find({ section: { $exists: false } });
    console.log(`Found ${students.length} students without sections`);
    
    const sections = ['A', 'B', 'C', 'D'];
    
    // Assign random sections to existing students
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const randomSection = sections[i % sections.length]; // Distribute evenly
      
      await Student.updateOne(
        { _id: student._id },
        { $set: { section: randomSection } }
      );
      
      console.log(`Updated ${student.name} (${student.id}) with section ${randomSection}`);
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

migrateSections();