import express from 'express';
import Payment from '../models/Payment.js';
import Student from '../models/Student.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payments by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.params.studentId }).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new payment
router.post('/', async (req, res) => {
  try {
    if (!req.body.id) {
      const lastPayment = await Payment.findOne().sort({ id: -1 });
      const lastId = lastPayment ? parseInt(lastPayment.id.replace('PAY', '')) : 0;
      req.body.id = `PAY${String(lastId + 1).padStart(4, '0')}`;
    }

    // Get student name
    const student = await Student.findOne({ id: req.body.studentId });
    if (student) {
      req.body.studentName = student.name;
    }

    const payment = new Payment(req.body);
    const savedPayment = await payment.save();

    // Update student's payment record
    if (student) {
      const monthKey = `${req.body.month}_${req.body.year}`;
      student.payments.set(monthKey, {
        month: req.body.month,
        year: req.body.year,
        paid: true,
        date: new Date().toISOString().split('T')[0],
        description: req.body.description || ''
      });
      await student.save();
    }

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ id: req.params.id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk payment update
router.post('/bulk', protect, async (req, res) => {
  try {
    const { studentIds, month, year, description } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }
    
    const results = [];
    const errors = [];
    
    for (const studentId of studentIds) {
      try {
        // Get student info
        const student = await Student.findOne({ id: studentId });
        if (!student) {
          errors.push(`Student ${studentId} not found`);
          continue;
        }
        
        // Generate payment ID
        const lastPayment = await Payment.findOne().sort({ id: -1 });
        const lastId = lastPayment ? parseInt(lastPayment.id.replace('PAY', '')) : 0;
        const paymentId = `PAY${String(lastId + results.length + 1).padStart(4, '0')}`;
        
        // Create payment record
        const payment = new Payment({
          id: paymentId,
          studentId: student.id,
          studentName: student.name,
          amount: 500,
          month,
          year,
          description
        });
        
        await payment.save();
        
        // Update student payment record
        const monthIndex = ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'].indexOf(month);
        const monthKey = `${year}-${monthIndex}`;
        student.payments.set(monthKey, {
          month,
          year,
          paid: true,
          date: new Date().toISOString().split('T')[0],
          description
        });
        await student.save();
        
        results.push({ studentId, paymentId, status: 'success' });
      } catch (error) {
        errors.push(`Error processing ${studentId}: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      processed: results.length,
      errors: errors.length,
      results,
      errors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;