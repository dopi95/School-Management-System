import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { validateProfilePicture } from './profilePicture.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({ message: 'Not authorized, admin not found' });
    }

    if (admin.status === 'inactive') {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    req.admin = admin;
    // Validate profile picture exists
    validateProfilePicture(req, res, next);
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    next();
  };
};