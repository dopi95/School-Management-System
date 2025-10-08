import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.get('/', protect, checkPermission('admin_management'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, adminId } = req.query;
    
    const filter = {};
    if (action) filter.action = action;
    if (adminId) filter.adminId = adminId;

    const logs = await ActivityLog.find(filter)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;