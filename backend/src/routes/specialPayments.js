import express from 'express';
import SpecialPayment from '../models/SpecialPayment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all special payments
router.get('/', async (req, res) => {
  try {
    const payments = await SpecialPayment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get special payments by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const payments = await SpecialPayment.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new special payment
router.post('/', async (req, res) => {
  try {
    // Generate ID if not provided
    if (!req.body.id) {
      const lastPayment = await SpecialPayment.findOne().sort({ id: -1 });
      const lastId = lastPayment ? parseInt(lastPayment.id.replace('SPPAY', '')) : 0;
      req.body.id = `SPPAY${String(lastId + 1).padStart(4, '0')}`;
    }

    const payment = new SpecialPayment(req.body);
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update special payment
router.put('/:id', async (req, res) => {
  try {
    const payment = await SpecialPayment.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Special payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete special payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await SpecialPayment.findOneAndDelete({ id: req.params.id });
    if (!payment) {
      return res.status(404).json({ message: 'Special payment not found' });
    }
    res.json({ message: 'Special payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk special payment update
router.post('/bulk', protect, async (req, res) => {
  try {
    const { studentIds, description, amount } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }
    
    const results = [];
    const errors = [];
    
    for (const studentId of studentIds) {
      try {
        // Generate payment ID
        const lastPayment = await SpecialPayment.findOne().sort({ id: -1 });
        const lastId = lastPayment ? parseInt(lastPayment.id.replace('SPPAY', '')) : 0;
        const paymentId = `SPPAY${String(lastId + results.length + 1).padStart(4, '0')}`;
        
        // Create special payment record
        const payment = new SpecialPayment({
          id: paymentId,
          studentId,
          amount: amount || 0,
          description,
          status: 'paid',
          paymentDate: new Date()
        });
        
        await payment.save();
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