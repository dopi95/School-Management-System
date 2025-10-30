import express from 'express';
import SpecialStudent from '../models/SpecialStudent.js';
import { logActivity } from '../utils/activityLogger.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all special students
router.get('/', async (req, res) => {
  try {
    const students = await SpecialStudent.find()
      .select('id name firstName middleName lastName firstNameAm middleNameAm lastNameAm class section phone status fatherPhone motherPhone joinedYear payments otherPayments email address dateOfBirth gender motherName fatherName photo paymentCode')
      .sort({ class: 1, section: 1, name: 1 })
      .lean()
      .maxTimeMS(10000);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get special student by ID
router.get('/:id', async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.id);
    const student = await SpecialStudent.findOne({ id: decodedId });
    if (!student) {
      return res.status(404).json({ message: 'Special student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new special student
router.post('/', async (req, res) => {
  try {
    // Generate ID if not provided
    if (!req.body.id) {
      const lastStudent = await SpecialStudent.findOne().sort({ id: -1 });
      const lastId = lastStudent ? parseInt(lastStudent.id.replace('SP', '')) : 0;
      req.body.id = `SP${String(lastId + 1).padStart(3, '0')}`;
    }

    // Check for duplicate ID
    const existingStudent = await SpecialStudent.findOne({ id: req.body.id });
    if (existingStudent) {
      return res.status(400).json({ message: 'Special student ID already exists' });
    }

    // Combine name fields for backward compatibility
    if (req.body.firstName && req.body.middleName && req.body.lastName) {
      req.body.name = `${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`;
    }

    const student = new SpecialStudent(req.body);
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update special student
router.put('/:id', async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.id);
    
    // Get existing student to preserve payments
    const existingStudent = await SpecialStudent.findOne({ id: decodedId });
    if (!existingStudent) {
      return res.status(404).json({ message: 'Special student not found' });
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
    
    const student = await SpecialStudent.findOneAndUpdate(
      { id: decodedId },
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update special student status
router.patch('/:id/status', async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.id);
    const { status } = req.body;
    const student = await SpecialStudent.findOneAndUpdate(
      { id: decodedId },
      { status },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Special student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update special student payment
router.patch('/:id/payment', protect, async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.id);
    const { monthKey, paymentData } = req.body;
    const student = await SpecialStudent.findOne({ id: decodedId });
    if (!student) {
      return res.status(404).json({ message: 'Special student not found' });
    }
    
    if (paymentData === null) {
      student.payments.delete(monthKey);
      await logActivity(req, 'SPECIAL_PAYMENT_MARKED_UNPAID', 'special_student', student.id, student.name, `Special payment marked as unpaid for ${monthKey}`);
    } else {
      student.payments.set(monthKey, paymentData);
      await logActivity(req, 'SPECIAL_PAYMENT_MARKED_PAID', 'special_student', student.id, student.name, `Special payment marked as paid for ${paymentData.month} ${paymentData.year}`);
    }
    await student.save();
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update special student other payment (book/material)
router.patch('/:id/other-payment', protect, async (req, res) => {
  try {
    const { year, paymentType, paid, description } = req.body;
    const decodedId = decodeURIComponent(req.params.id);
    const student = await SpecialStudent.findOne({ id: decodedId });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Special student not found' });
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
      'SPECIAL_STUDENT_OTHER_PAYMENT_UPDATE',
      'SpecialStudent',
      student.id,
      student.name,
      `Updated ${paymentType} payment for ${year}: ${paid ? 'Paid' : 'Unpaid'}`
    );
    
    res.json({ success: true, student });
  } catch (error) {
    console.error('Error updating special student other payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update special students
router.patch('/bulk/update', async (req, res) => {
  try {
    const { studentIds, updates } = req.body;
    await SpecialStudent.updateMany(
      { id: { $in: studentIds } },
      updates
    );
    const updatedStudents = await SpecialStudent.find({ id: { $in: studentIds } });
    res.json(updatedStudents);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete special student
router.delete('/:id', async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.id);
    const student = await SpecialStudent.findOneAndDelete({ id: decodedId });
    if (!student) {
      return res.status(404).json({ message: 'Special student not found' });
    }
    res.json({ message: 'Special student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;