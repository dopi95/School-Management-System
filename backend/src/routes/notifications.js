import express from 'express';
import Notification from '../models/Notification.js';
import Student from '../models/Student.js';
import SpecialStudent from '../models/SpecialStudent.js';
import { logActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students for notification
router.get('/students', async (req, res) => {
  try {
    const [students, specialStudents] = await Promise.all([
      Student.find({ status: 'active' })
        .select('id name firstName middleName lastName firstNameAm middleNameAm lastNameAm class fatherPhone motherPhone paymentCode')
        .sort({ name: 1 }),
      SpecialStudent.find({ status: 'active' })
        .select('id name firstName middleName lastName firstNameAm middleNameAm lastNameAm class fatherPhone motherPhone paymentCode')
        .sort({ name: 1 })
    ]);
    
    const regularStudents = students.map(student => ({
      id: student.id,
      name: student.name || `${student.firstName} ${student.middleName} ${student.lastName}`,
      firstNameAm: student.firstNameAm,
      middleNameAm: student.middleNameAm,
      lastNameAm: student.lastNameAm,
      class: student.class,
      fatherPhone: student.fatherPhone,
      motherPhone: student.motherPhone,
      parentPhone: student.fatherPhone || student.motherPhone || '',
      type: 'Students',
      paymentCode: student.paymentCode || 'N/A'
    })).filter(student => student.parentPhone);
    
    const spStudents = specialStudents.map(student => ({
      id: student.id,
      name: student.name || `${student.firstName} ${student.middleName} ${student.lastName}`,
      firstNameAm: student.firstNameAm,
      middleNameAm: student.middleNameAm,
      lastNameAm: student.lastNameAm,
      class: student.class,
      fatherPhone: student.fatherPhone,
      motherPhone: student.motherPhone,
      parentPhone: student.fatherPhone || student.motherPhone || '',
      type: 'SP Students',
      paymentCode: student.paymentCode || 'N/A'
    })).filter(student => student.parentPhone);
    
    const studentsWithPhone = [...regularStudents, ...spStudents];

    res.json(studentsWithPhone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send notification
router.post('/send', async (req, res) => {
  try {
    const { title, message, recipients, template } = req.body;
    
    const notification = new Notification({
      title,
      message,
      recipients,
      template,
      sentBy: req.admin.name,
      status: 'sent' // For now, we'll mark as sent since actual SMS sending is not implemented
    });

    await notification.save();
    await logActivity(req, 'NOTIFICATION_SEND', 'System', null, null, `Notification sent to ${recipients.length} recipients: ${title}`);
    res.status(201).json({ message: 'Notification sent successfully', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get message templates
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'payment_reminder',
      name: 'Payment Reminder',
      template: 'Dear parent of {{studentName}}, this is a reminder that the payment for {{studentClass}} is due. Please contact the school for more information.'
    },
    {
      id: 'meeting_notice',
      name: 'Meeting Notice',
      template: 'Dear parent of {{studentName}}, there will be a parent meeting for {{studentClass}} students. Please attend on the scheduled date.'
    },
    {
      id: 'exam_notice',
      name: 'Exam Notice',
      template: 'Dear parent of {{studentName}}, upcoming exams for {{studentClass}} will begin soon. Please ensure your child is prepared.'
    },
    {
      id: 'general_notice',
      name: 'General Notice',
      template: 'Dear parent of {{studentName}}, we would like to inform you about important updates regarding {{studentClass}}.'
    }
  ];
  
  res.json(templates);
});

export default router;