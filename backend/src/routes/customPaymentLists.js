import express from 'express';
import CustomPaymentList from '../models/CustomPaymentList.js';
import Student from '../models/Student.js';
import SpecialStudent from '../models/SpecialStudent.js';
import { protect } from '../middleware/auth.js';
import { logActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Get all custom payment lists
router.get('/', protect, async (req, res) => {
  try {
    const lists = await CustomPaymentList.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single custom payment list
router.get('/:id', protect, async (req, res) => {
  try {
    const list = await CustomPaymentList.findById(req.params.id).lean();
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new custom payment list
router.post('/', protect, async (req, res) => {
  try {
    const { title, year } = req.body;
    
    const list = new CustomPaymentList({
      title,
      year,
      students: [],
      createdBy: req.admin.id
    });

    const savedList = await list.save();
    
    await logActivity(req, 'CUSTOM_LIST_CREATED', 'CustomPaymentList', savedList._id, title, `Custom payment list created: ${title} (${year})`);
    
    res.status(201).json(savedList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update custom payment list
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, year } = req.body;
    
    const list = await CustomPaymentList.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    list.title = title;
    list.year = year;
    list.updatedAt = new Date();
    
    const updatedList = await list.save();
    
    await logActivity(req, 'CUSTOM_LIST_UPDATED', 'CustomPaymentList', updatedList._id, title, `Custom payment list updated: ${title} (${year})`);
    
    res.json(updatedList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add students manually with payment details
router.post('/:id/students/manual', protect, async (req, res) => {
  try {
    const { studentName, class: studentClass, section, amountPaid, paymentType, paymentDate } = req.body;
    const list = await CustomPaymentList.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Create a student payment entry
    const newStudent = {
      studentId: `MANUAL_${Date.now()}`,
      studentName: studentName.trim(),
      class: studentClass,
      section: section,
      amountPaid: amountPaid,
      paymentType: paymentType,
      paymentDate: paymentDate,
      addedAt: new Date()
    };

    list.students.push(newStudent);
    list.updatedAt = new Date();
    
    await list.save();
    
    await logActivity(req, 'PAYMENT_ADDED_TO_LIST', 'CustomPaymentList', list._id, list.title, `Payment added for ${studentName} to list: ${list.title}`);
    
    res.json({ message: 'Payment added successfully', list });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add students to list (keep original for compatibility)
router.post('/:id/students', protect, async (req, res) => {
  try {
    const { studentIds } = req.body;
    const list = await CustomPaymentList.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Get student details from both collections
    const [students, specialStudents] = await Promise.all([
      Student.find({ id: { $in: studentIds }, status: 'active' }).lean(),
      SpecialStudent.find({ id: { $in: studentIds }, status: 'active' }).lean()
    ]);

    const allStudents = [...students, ...specialStudents];
    
    // Add students to list (avoid duplicates)
    const existingStudentIds = list.students.map(s => s.studentId);
    const newStudents = allStudents
      .filter(student => !existingStudentIds.includes(student.id))
      .map(student => ({
        studentId: student.id,
        studentName: student.name || `${student.firstName} ${student.middleName} ${student.lastName}`,
        class: student.class,
        addedAt: new Date()
      }));

    list.students.push(...newStudents);
    list.updatedAt = new Date();
    
    await list.save();
    
    await logActivity(req, 'STUDENTS_ADDED_TO_LIST', 'CustomPaymentList', list._id, list.title, `${newStudents.length} students added to list: ${list.title}`);
    
    res.json({ message: `${newStudents.length} students added successfully`, list });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student in list
router.put('/:id/students/:studentId', protect, async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Student ID:', req.params.studentId);
    
    const { studentName, class: studentClass, section, amountPaid, paymentType, paymentDate } = req.body;
    
    if (!studentName || !studentClass || !amountPaid || !paymentDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const list = await CustomPaymentList.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const studentIndex = list.students.findIndex(s => s.studentId === req.params.studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in list' });
    }

    // Update student data while preserving studentId
    list.students[studentIndex].studentName = studentName.trim();
    list.students[studentIndex].class = studentClass;
    list.students[studentIndex].section = section;
    list.students[studentIndex].amountPaid = amountPaid;
    list.students[studentIndex].paymentType = paymentType || 'cash';
    list.students[studentIndex].paymentDate = paymentDate;
    
    list.updatedAt = new Date();
    await list.save();
    
    await logActivity(req, 'STUDENT_UPDATED_IN_LIST', 'CustomPaymentList', list._id, list.title, `Student ${studentName} updated in list: ${list.title}`);
    
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Remove student from list
router.delete('/:id/students/:studentId', protect, async (req, res) => {
  try {
    const list = await CustomPaymentList.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const studentIndex = list.students.findIndex(s => s.studentId === req.params.studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in list' });
    }

    const removedStudent = list.students[studentIndex];
    list.students.splice(studentIndex, 1);
    list.updatedAt = new Date();
    
    await list.save();
    
    await logActivity(req, 'STUDENT_REMOVED_FROM_LIST', 'CustomPaymentList', list._id, list.title, `Student ${removedStudent.studentName} removed from list: ${list.title}`);
    
    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete custom payment list
router.delete('/:id', protect, async (req, res) => {
  try {
    const list = await CustomPaymentList.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    await CustomPaymentList.findByIdAndDelete(req.params.id);
    
    await logActivity(req, 'CUSTOM_LIST_DELETED', 'CustomPaymentList', list._id, list.title, `Custom payment list deleted: ${list.title} (${list.year})`);
    
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;