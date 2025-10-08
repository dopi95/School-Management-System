import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (req, action, targetType = null, targetId = null, targetName = null, details = null) => {
  try {
    // Get fresh admin data from token to ensure accuracy
    let admin = req.admin;
    
    if (!admin) {
      console.log('No admin found in request for activity logging');
      return;
    }

    // Re-fetch admin from database to get latest info
    const jwt = await import('jsonwebtoken');
    const Admin = (await import('../models/Admin.js')).default;
    
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const freshAdmin = await Admin.findById(decoded.id).select('name _id');
        if (freshAdmin) {
          admin = freshAdmin;
        }
      } catch (tokenError) {
        console.log('Token verification failed, using req.admin');
      }
    }

    console.log('Logging activity for admin:', admin.name, 'ID:', admin._id);
    
    await ActivityLog.create({
      adminId: admin._id,
      adminName: admin.name,
      action,
      targetType,
      targetId: targetId?.toString(),
      targetName,
      details,
      ipAddress: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress,
      userAgent: req.get ? req.get('User-Agent') : req.headers?.['user-agent']
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};