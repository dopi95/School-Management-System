import SpecialStudent from './models/SpecialStudent.js';
import SpecialPayment from './models/SpecialPayment.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedSpecialStudents = [
  { id: 'SP001', name: 'Ahmed Hassan', phone: '+251911111111', fatherPhone: '+251911111111', class: 'KG-1', section: 'A', status: 'active', payments: {} },
  { id: 'SP002', name: 'Fatima Ali', phone: '+251922222222', fatherPhone: '+251922222222', class: 'KG-2', section: 'B', status: 'active', payments: {} },
  { id: 'SP003', name: 'Omar Ibrahim', phone: '+251933333333', fatherPhone: '+251933333333', class: 'KG-3', section: 'C', status: 'active', payments: {} },
  { id: 'SP004', name: 'Aisha Mohamed', phone: '+251944444444', fatherPhone: '+251944444444', class: 'KG-1', section: 'D', status: 'active', payments: {} },
  { id: 'SP005', name: 'Yusuf Ahmed', phone: '+251955555555', fatherPhone: '+251955555555', class: 'KG-2', section: 'A', status: 'inactive', payments: {} }
];

const seedSpecialPayments = [
  { id: 'SPPAY0001', studentId: 'SP001', studentName: 'Ahmed Hassan', amount: 500, month: 'January', year: '2024', status: 'paid' },
  { id: 'SPPAY0002', studentId: 'SP002', studentName: 'Fatima Ali', amount: 500, month: 'January', year: '2024', status: 'paid' },
  { id: 'SPPAY0003', studentId: 'SP003', studentName: 'Omar Ibrahim', amount: 500, month: 'January', year: '2024', status: 'paid' }
];

const seedSpecialDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing special data
    await SpecialStudent.deleteMany({});
    await SpecialPayment.deleteMany({});
    console.log('Cleared existing special data');
    
    // Insert seed data
    await SpecialStudent.insertMany(seedSpecialStudents);
    await SpecialPayment.insertMany(seedSpecialPayments);
    console.log('Special seed data inserted successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding special database:', error);
    process.exit(1);
  }
};

seedSpecialDatabase();