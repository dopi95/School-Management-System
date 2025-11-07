import express from 'express';
import Student from '../models/Student.js';
import { logActivity } from '../utils/activityLogger.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get students table data (basic info for fast loading)
router.get('/', async (req, res) => {
  try {
    const students = await Student.find()
      .select('id name firstName middleName lastName firstNameAm middleNameAm lastNameAm paymentCode class section phone status gender payments fatherName motherName fatherFirstName fatherMiddleName fatherLastName motherFirstName motherMiddleName motherLastName')
      .sort({ class: 1, section: 1, name: 1 })
      .lean()
      .maxTimeMS(5000);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students with full details (for exports and detailed operations)
router.get('/full', async (req, res) => {
  try {
    const students = await Student.find()
      .select('id name firstName middleName lastName firstNameAm middleNameAm lastNameAm class section phone status fatherPhone motherPhone joinedYear payments otherPayments email address dateOfBirth gender motherName fatherName photo paymentCode')
      .sort({ class: 1, section: 1, name: 1 })
      .lean()
      .maxTimeMS(10000);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const studentId = decodeURIComponent(req.params.id);
    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    // Generate ID if not provided
    if (!req.body.id) {
      const lastStudent = await Student.findOne().sort({ id: -1 });
      const lastId = lastStudent ? parseInt(lastStudent.id.replace('ST', '')) : 0;
      req.body.id = `ST${String(lastId + 1).padStart(3, '0')}`;
    }

    // Check for duplicate ID
    const existingStudent = await Student.findOne({ id: req.body.id });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    // Combine name fields for backward compatibility
    if (req.body.firstName && req.body.middleName && req.body.lastName) {
      req.body.name = `${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`;
    }

    const student = new Student(req.body);
    const savedStudent = await student.save();
    await logActivity(req, 'STUDENT_CREATE', 'Student', savedStudent.id, savedStudent.name, `Student created: ${savedStudent.name}`);
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const studentId = decodeURIComponent(req.params.id);
    
    // Get existing student to preserve payments
    const existingStudent = await Student.findOne({ id: studentId });
    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Combine name fields for backward compatibility
    if (req.body.firstName && req.body.middleName && req.body.lastName) {
      req.body.name = `${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`;
    }
    
    // Preserve existing payments data
    const updateData = {
      ...req.body,
      payments: existingStudent.payments
    };
    
    const student = await Student.findOneAndUpdate(
      { id: studentId },
      updateData,
      { new: true, runValidators: true }
    );
    
    await logActivity(req, 'STUDENT_UPDATE', 'Student', student.id, student.name, `Student updated: ${student.name}`);
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student status
router.patch('/:id/status', async (req, res) => {
  try {
    const studentId = decodeURIComponent(req.params.id);
    const { status } = req.body;
    const student = await Student.findOneAndUpdate(
      { id: studentId },
      { status },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await logActivity(req, 'STUDENT_STATUS_CHANGE', 'Student', student.id, student.name, `Student status changed to ${status}: ${student.name}`);
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student payment
router.patch('/:id/payment', async (req, res) => {
  try {
    const studentId = decodeURIComponent(req.params.id);
    const { monthKey, paymentData } = req.body;
    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (paymentData === null) {
      student.payments.delete(monthKey);
    } else {
      student.payments.set(monthKey, paymentData);
    }
    await student.save();
    await logActivity(req, 'STUDENT_PAYMENT_UPDATE', 'Student', student.id, student.name, `Payment updated for ${monthKey}: ${student.name}`);
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student other payment (book/material)
router.patch('/:id/other-payment', protect, async (req, res) => {
  try {
    const { year, paymentType, paid, description } = req.body;
    const student = await Student.findOne({ id: decodeURIComponent(req.params.id) });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Initialize otherPayments if it doesn't exist
    if (!student.otherPayments) {
      student.otherPayments = new Map();
    }
    
    // Get or create year entry
    const yearPayments = student.otherPayments.get(year.toString()) || {};
    
    // Update the specific payment type
    yearPayments[paymentType] = paid;
    if (paid) {
      yearPayments[`${paymentType}Date`] = new Date().toISOString().split('T')[0];
      yearPayments[`${paymentType}Description`] = description;
    } else {
      delete yearPayments[`${paymentType}Date`];
      delete yearPayments[`${paymentType}Description`];
    }
    
    // Set the updated payments for the year
    student.otherPayments.set(year.toString(), yearPayments);
    
    await student.save();
    
    // Log activity
    await logActivity(
      req,
      'STUDENT_OTHER_PAYMENT_UPDATE',
      'Student',
      student.id,
      student.name,
      `Updated ${paymentType} payment for ${year}: ${paid ? 'Paid' : 'Unpaid'}`
    );
    
    res.json({ success: true, student });
  } catch (error) {
    console.error('Error updating other payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update students
router.patch('/bulk/update', async (req, res) => {
  try {
    const { studentIds, updates } = req.body;
    await Student.updateMany(
      { id: { $in: studentIds } },
      updates
    );
    const updatedStudents = await Student.find({ id: { $in: studentIds } });
    res.json(updatedStudents);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const studentId = decodeURIComponent(req.params.id);
    const student = await Student.findOneAndDelete({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await logActivity(req, 'STUDENT_DELETE', 'Student', student.id, student.name, `Student deleted: ${student.name}`);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;