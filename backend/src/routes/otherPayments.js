import express from 'express';
import OtherPayment from '../models/OtherPayment.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Get other payments by year
router.get('/', protect, (req, res, next) => {
  // Allow superadmin, admin, and executive (user) roles to view
  if (req.admin.role === 'superadmin' || req.admin.role === 'admin' || req.admin.role === 'user') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}, async (req, res) => {
  try {
    const { year } = req.query;
    const query = year ? { year } : {};
    
    const payments = await OtherPayment.find(query).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create or update other payment
router.post('/', protect, (req, res, next) => {
  // Only allow superadmin and admin roles to create
  if (req.admin.role === 'superadmin' || req.admin.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}, async (req, res) => {
  try {
    const { studentId, studentType, type, year, description, paid, paidAt } = req.body;

    const existingPayment = await OtherPayment.findOne({
      studentId,
      type,
      year
    });

    if (existingPayment) {
      existingPayment.description = description;
      existingPayment.paid = paid;
      existingPayment.paidAt = paidAt;
      await existingPayment.save();
      res.json(existingPayment);
    } else {
      const payment = new OtherPayment({
        studentId,
        studentType,
        type,
        year,
        description,
        paid,
        paidAt
      });
      await payment.save();
      res.status(201).json(payment);
    }
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Payment record already exists for this student, type, and year' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Update other payment
router.put('/:id', protect, (req, res, next) => {
  // Only allow superadmin and admin roles to edit
  if (req.admin.role === 'superadmin' || req.admin.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}, async (req, res) => {
  try {
    const payment = await OtherPayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete other payment
router.delete('/:id', protect, (req, res, next) => {
  // Only allow superadmin and admin roles to delete
  if (req.admin.role === 'superadmin' || req.admin.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}, async (req, res) => {
  try {
    const payment = await OtherPayment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;