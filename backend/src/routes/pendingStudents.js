import express from 'express';
import PendingStudent from '../models/PendingStudent.js';
import Student from '../models/Student.js';
import { logActivity } from '../utils/activityLogger.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Public route - Submit student registration (no auth required)
router.post('/register', async (req, res) => {
  try {
    // Generate unique PEND ID (check both pending and approved students)
    const lastPending = await PendingStudent.findOne({ id: /^PEND\d+$/ }).sort({ createdAt: -1 }).lean();
    const lastApproved = await Student.findOne({ originalPendingId: /^PEND\d+$/ }).sort({ createdAt: -1 }).lean();
    
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

// Get all pending students (including approved/rejected for status tracking)
router.get('/', protect, async (req, res) => {
  try {
    const pendingStudents = await PendingStudent.find({})
      .select('id firstName middleName lastName class fatherPhone fatherName motherName createdAt status approvedAs studentType')
      .sort({ status: 1, createdAt: -1 }) // pending first, then others
      .lean()
      .maxTimeMS(5000);
    res.json(pendingStudents);
  } catch (error) {
    console.error('Error fetching pending students:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve pending student
router.post('/:id/approve', protect, async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.id);
    const pendingStudent = await PendingStudent.findOne({ id: decodedId }).lean();
    if (!pendingStudent) {
      return res.status(404).json({ message: 'Pending student not found' });
    }

    // Generate unique student ID
    const lastStudent = await Student.findOne({ id: /^ST\d+$/ }).sort({ id: -1 }).lean();
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

    // Update status instead of deleting
    await PendingStudent.findOneAndUpdate(
      { id: decodedId },
      { status: 'approved', approvedAs: 'regular' }
    );

    await logActivity(req, 'STUDENT_APPROVED', 'Student', student.id, student.name, `Student approved from pending: ${student.name}`);
    res.json({ message: 'Student approved successfully', student });
  } catch (error) {
    console.error('Error approving student:', error);
    res.status(400).json({ message: error.message });
  }
});

// Approve pending student as special student
router.post('/:id/approve-special', protect, async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.id);
    const pendingStudent = await PendingStudent.findOne({ id: decodedId }).lean();
    if (!pendingStudent) {
      return res.status(404).json({ message: 'Pending student not found' });
    }

    // Import SpecialStudent model
    const SpecialStudent = (await import('../models/SpecialStudent.js')).default;

    // Generate unique special student ID with joined year
    const lastSpecialStudent = await SpecialStudent.findOne({ id: /^SP\d+$/ }).sort({ id: -1 }).lean();
    let nextNumber = 1;
    if (lastSpecialStudent) {
      const lastNumber = parseInt(lastSpecialStudent.id.replace('SP', '').split('/')[0]);
      nextNumber = lastNumber + 1;
    }
    const specialStudentId = `SP${String(nextNumber).padStart(3, '0')}/${pendingStudent.joinedYear}`;

    // Create special student record
    const specialStudentData = {
      id: specialStudentId,
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

    const specialStudent = new SpecialStudent(specialStudentData);
    await specialStudent.save();

    // Update status instead of deleting
    await PendingStudent.findOneAndUpdate(
      { id: decodedId },
      { status: 'approved', approvedAs: 'special' }
    );

    await logActivity(req, 'SPECIAL_STUDENT_APPROVED', 'SpecialStudent', specialStudent.id, specialStudent.name, `Special student approved from pending: ${specialStudent.name}`);
    res.json({ message: 'Special student approved successfully', student: specialStudent });
  } catch (error) {
    console.error('Error approving special student:', error);
    res.status(400).json({ message: error.message });
  }
});

// Reject pending student (update status and remove from main lists if approved)
router.post('/:id/reject', protect, async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.id);
    const pendingStudent = await PendingStudent.findOne({ id: decodedId }).lean();
    
    if (!pendingStudent) {
      return res.status(404).json({ message: 'Pending student not found' });
    }

    // If student was previously approved, remove from main lists
    if (pendingStudent.status === 'approved') {
      try {
        if (pendingStudent.approvedAs === 'special') {
          const SpecialStudent = (await import('../models/SpecialStudent.js')).default;
          // Find by matching personal information
          const deleted = await SpecialStudent.findOneAndDelete({
            firstName: pendingStudent.firstName,
            middleName: pendingStudent.middleName,
            lastName: pendingStudent.lastName,
            fatherPhone: pendingStudent.fatherPhone
          });
          console.log('Deleted special student:', deleted ? 'Success' : 'Not found');
        } else {
          // Find by matching personal information
          const deleted = await Student.findOneAndDelete({
            firstName: pendingStudent.firstName,
            middleName: pendingStudent.middleName,
            lastName: pendingStudent.lastName,
            fatherPhone: pendingStudent.fatherPhone
          });
          console.log('Deleted regular student:', deleted ? 'Success' : 'Not found');
        }
      } catch (error) {
        console.error('Error deleting approved student:', error);
      }
    }

    // Update status to rejected
    const updatedStudent = await PendingStudent.findOneAndUpdate(
      { id: decodedId },
      { status: 'rejected' },
      { new: true }
    ).lean();

    await logActivity(req, 'STUDENT_REJECTED', 'PendingStudent', updatedStudent.id, updatedStudent.name || `${updatedStudent.firstName} ${updatedStudent.lastName}`, `Student registration rejected: ${updatedStudent.name || `${updatedStudent.firstName} ${updatedStudent.lastName}`}`);
    res.json({ message: 'Student registration rejected successfully' });
  } catch (error) {
    console.error('Error rejecting student:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete pending student (permanent removal)
router.delete('/:id/reject', protect, async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.id);
    const pendingStudent = await PendingStudent.findOneAndDelete({ id: decodedId }).lean();
    if (!pendingStudent) {
      return res.status(404).json({ message: 'Pending student not found' });
    }

    await logActivity(req, 'STUDENT_DELETED', 'PendingStudent', pendingStudent.id, pendingStudent.name || `${pendingStudent.firstName} ${pendingStudent.lastName}`, `Student registration deleted: ${pendingStudent.name || `${pendingStudent.firstName} ${pendingStudent.lastName}`}`);
    res.json({ message: 'Student registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;