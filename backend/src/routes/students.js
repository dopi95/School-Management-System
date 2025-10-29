import express from 'express';
import Student from '../models/Student.js';
import { logActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find()
      .select('id name firstName middleName lastName firstNameAm middleNameAm lastNameAm class section phone status fatherPhone motherPhone joinedYear payments')
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
    const studentId = req.params.id;
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
    const studentId = req.params.id;
    
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
    const studentId = req.params.id;
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
    const studentId = req.params.id;
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
    const studentId = req.params.id;
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