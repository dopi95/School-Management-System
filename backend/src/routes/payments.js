import express from 'express';
import Payment from '../models/Payment.js';
import Student from '../models/Student.js';

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

export default router;