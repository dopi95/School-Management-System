import Student from './models/Student.js';
import Employee from './models/Employee.js';
import Payment from './models/Payment.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedStudents = [
  { id: 'ST001', name: 'Alice Johnson', phone: '+251911234567', fatherPhone: '+251911234567', class: 'KG-1', section: 'A', status: 'active', payments: {} },
  { id: 'ST002', name: 'Bob Smith', phone: '+251922345678', fatherPhone: '+251922345678', class: 'KG-2', section: 'B', status: 'active', payments: {} },
  { id: 'ST003', name: 'Carol Davis', phone: '+251933456789', fatherPhone: '+251933456789', class: 'KG-3', section: 'A', status: 'active', payments: {} },
  { id: 'ST004', name: 'David Wilson', phone: '+251944567890', fatherPhone: '+251944567890', class: 'KG-1', section: 'B', status: 'active', payments: {} },
  { id: 'ST005', name: 'Eva Brown', phone: '+251955678901', fatherPhone: '+251955678901', class: 'KG-2', section: 'A', status: 'active', payments: {} },
  { id: 'ST006', name: 'Frank Miller', phone: '+251966789012', fatherPhone: '+251966789012', class: 'KG-3', section: 'C', status: 'inactive', payments: {} }
];

const seedEmployees = [
  { id: 'EMP001', name: 'Dr. Sarah Connor', phone: '+251911234567', email: 'sarah@school.com', position: 'Teacher', department: 'Education', salary: 5000, status: 'active' },
  { id: 'EMP002', name: 'Mr. John Doe', phone: '+251922345678', email: 'john@school.com', position: 'Teacher', department: 'Education', salary: 4800, status: 'active' },
  { id: 'EMP003', name: 'Ms. Jane Smith', phone: '+251933456789', email: 'jane@school.com', position: 'Assistant', department: 'Administration', salary: 3500, status: 'active' },
  { id: 'EMP004', name: 'Prof. Mike Johnson', phone: '+251944567890', email: 'mike@school.com', position: 'Principal', department: 'Administration', salary: 8000, status: 'active' },
  { id: 'EMP005', name: 'Dr. Emily Davis', phone: '+251955678901', email: 'emily@school.com', position: 'Teacher', department: 'Education', salary: 5200, status: 'inactive' }
];

const seedPayments = [
  { id: 'PAY0001', studentId: 'ST001', studentName: 'Alice Johnson', amount: 500, month: 'January', year: '2024', status: 'paid' },
  { id: 'PAY0002', studentId: 'ST002', studentName: 'Bob Smith', amount: 500, month: 'January', year: '2024', status: 'paid' },
  { id: 'PAY0003', studentId: 'ST003', studentName: 'Carol Davis', amount: 500, month: 'January', year: '2024', status: 'paid' }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Student.deleteMany({});
    await Employee.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert seed data
    await Student.insertMany(seedStudents);
    await Employee.insertMany(seedEmployees);
    await Payment.insertMany(seedPayments);
    console.log('Seed data inserted successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();