import express from 'express';
import PendingStudent from '../models/PendingStudent.js';
import Student from '../models/Student.js';
import { logActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Public route - Submit student registration (no auth required)
router.post('/register', async (req, res) => {
  try {
    // Generate unique PEND ID (check both pending and approved students)
    const lastPending = await PendingStudent.findOne({ id: /^PEND\d+$/ }).sort({ createdAt: -1 });
    const lastApproved = await Student.findOne({ originalPendingId: /^PEND\d+$/ }).sort({ createdAt: -1 });
    
    let nextNumber = 1;
    if (lastPending) {
      const lastPendingNumber = parseInt(lastPending.id.replace('PEND', ''));
      nextNumber = Math.max(nextNumber, lastPendingNumber + 1);
    }
    if (lastApproved && lastApproved.originalPendingId) {
      const lastApprovedNumber = parseInt(lastApproved.originalPendingId.replace('PEND', ''));
      nextNumber = Math.max(nextNumber, lastApprovedNumber + 1);
    }
    
    const pendingId = `PEND${String(nextNumber).padStart(2, '0')}`;

    const pendingStudent = new PendingStudent({
      ...req.body,
      id: pendingId,
      name: `${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`.trim(),
      phone: req.body.fatherPhone
    });

    const savedStudent = await pendingStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all pending students (auth required)
router.get('/', async (req, res) => {
  try {
    const pendingStudents = await PendingStudent.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(pendingStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve pending student
router.post('/:id/approve', async (req, res) => {
  try {
    const pendingStudent = await PendingStudent.findOne({ id: req.params.id });
    if (!pendingStudent) {
      return res.status(404).json({ message: 'Pending student not found' });
    }

    // Generate unique student ID
    const lastStudent = await Student.findOne({ id: /^ST\d+$/ }).sort({ id: -1 });
    let nextNumber = 1;
    if (lastStudent) {
      const lastNumber = parseInt(lastStudent.id.replace('ST', ''));
      nextNumber = lastNumber + 1;
    }
    const studentId = `ST${String(nextNumber).padStart(3, '0')}`;

    // Create student record
    const studentData = {
      id: studentId,
      originalPendingId: pendingStudent.id,
      firstName: pendingStudent.firstName,
      middleName: pendingStudent.middleName,
      lastName: pendingStudent.lastName,
      firstNameAm: pendingStudent.firstNameAm,
      middleNameAm: pendingStudent.middleNameAm,
      lastNameAm: pendingStudent.lastNameAm,
      gender: pendingStudent.gender,
      email: pendingStudent.email,
      dateOfBirth: pendingStudent.dateOfBirth,
      joinedYear: pendingStudent.joinedYear,
      address: pendingStudent.address,
      class: pendingStudent.class,
      fatherName: pendingStudent.fatherName,
      fatherPhone: pendingStudent.fatherPhone,
      motherName: pendingStudent.motherName,
      motherPhone: pendingStudent.motherPhone,
      photo: pendingStudent.photo,
      name: `${pendingStudent.firstName} ${pendingStudent.middleName} ${pendingStudent.lastName}`.trim(),
      phone: pendingStudent.fatherPhone,
      status: 'active',
      payments: {}
    };

    const student = new Student(studentData);
    await student.save();

    // Remove from pending
    await PendingStudent.findOneAndDelete({ id: req.params.id });

    await logActivity(req, 'STUDENT_APPROVED', 'Student', student.id, student.name, `Student approved from pending: ${student.name}`);
    res.json({ message: 'Student approved successfully', student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject pending student
router.delete('/:id/reject', async (req, res) => {
  try {
    const pendingStudent = await PendingStudent.findOneAndDelete({ id: req.params.id });
    if (!pendingStudent) {
      return res.status(404).json({ message: 'Pending student not found' });
    }

    await logActivity(req, 'STUDENT_REJECTED', 'PendingStudent', pendingStudent.id, pendingStudent.name, `Student registration rejected: ${pendingStudent.name}`);
    res.json({ message: 'Student registration rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;