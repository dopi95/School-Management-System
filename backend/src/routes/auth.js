import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Admin from '../models/Admin.js';
import AdminActivityLog from '../models/AdminActivityLog.js';
import { protect, authorize } from '../middleware/auth.js';
import { logActivity } from '../utils/activityLogger.js';
import sendEmailAPI from '../utils/sendEmailAPI.js';

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profiles';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (admin.status === 'inactive') {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Update last login without triggering password hashing
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    // Log login activity
    const mockReq = { admin, ip: req.ip, get: req.get.bind(req), connection: req.connection, socket: req.socket, headers: req.headers };
    await logActivity(mockReq, 'LOGIN', 'System', null, null, 'Admin logged in');

    const token = generateToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    res.json({
      success: true,
      token,
      refreshToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        status: admin.status,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current admin profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        permissions: req.admin.permissions,
        status: req.admin.status,
        lastLogin: req.admin.lastLogin,
        profilePicture: req.admin.profilePicture,
        createdAt: req.admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update admin profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id).select('+password');
    
    const originalData = {
      name: admin.name,
      email: admin.email
    };
    
    const changes = {};
    let actionType = 'profile_update';

    if (name && name !== admin.name) {
      changes.name = { from: admin.name, to: name };
      admin.name = name;
    }
    if (email && email !== admin.email) {
      changes.email = { from: admin.email, to: email };
      admin.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }

      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Set the new password (will be hashed by pre-save middleware)
      admin.plainPassword = newPassword;
      admin.password = newPassword;
      admin.markModified('password'); // Explicitly mark password as modified
      changes.password = { changed: true, newPassword: newPassword };
      actionType = 'password_change';
    }

    await admin.save();
    
    // Log the activity if there were changes
    if (Object.keys(changes).length > 0) {
      const action = newPassword ? 'PASSWORD_CHANGE' : 'PROFILE_UPDATE';
      await logActivity(req, action, 'Profile', admin._id, admin.name, `Profile updated: ${Object.keys(changes).join(', ')}`);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        status: admin.status
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all admins
// @route   GET /api/auth/admins
// @access  Private (superadmin only)
router.get('/admins', protect, authorize('superadmin'), async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').populate('createdBy', 'name email');
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all admin profiles with passwords (SuperAdmin only)
// @route   GET /api/auth/admins/profiles
// @access  Private (superadmin only)
router.get('/admins/profiles', protect, authorize('superadmin'), async (req, res) => {
  try {
    const admins = await Admin.find().select('+password +plainPassword').populate('createdBy', 'name email');
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get admin activity logs (SuperAdmin only)
// @route   GET /api/auth/admins/activity-logs
// @access  Private (superadmin only)
router.get('/admins/activity-logs', protect, authorize('superadmin'), async (req, res) => {
  try {
    const logs = await AdminActivityLog.find()
      .populate('adminId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new admin
// @route   POST /api/auth/admins
// @access  Private (superadmin only)
router.post('/admins', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      plainPassword: password, // Store plain password for SuperAdmin viewing
      role: role || 'admin',
      permissions: permissions || {
        dashboard: true,
        students: false,
        inactiveStudents: false,
        employees: false,
        inactiveEmployees: false,
        payments: false,
        specialStudents: false,
        specialPayments: false,
        admins: false,
        profile: true,
        settings: false
      },
      createdBy: req.admin._id
    });

    // Send welcome email with login credentials
    try {
      await sendEmailAPI({
        email: admin.email,
        subject: 'Welcome to Bluelight Academy Management System',
        message: `Welcome ${name}! Your admin account has been created. Email: ${email}, Password: ${password}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Bluelight Academy</h2>
            <p>Hello ${name},</p>
            <p>Your admin account has been created successfully by the superadmin.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #007bff; margin: 0 0 15px 0;">Your Login Credentials</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Role:</strong> ${role || 'admin'}</p>
            </div>
            <p><strong>Important:</strong> Please change your password after your first login for security.</p>
            <p>You can access the system at: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Bluelight Academy Management System</p>
          </div>
        `
      });
    } catch (emailError) {
      console.log('Failed to send welcome email:', emailError.message);
    }

    await logActivity(req, 'ADMIN_CREATE', 'Admin', admin._id, admin.name, `New admin created: ${admin.name}`);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully and welcome email sent',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        status: admin.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update admin
// @route   PUT /api/auth/admins/:id
// @access  Private (superadmin only)
router.put('/admins/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { name, email, role, status, permissions, password } = req.body;
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const changes = {};
    let actionType = 'profile_update';

    if (name && name !== admin.name) {
      changes.name = { from: admin.name, to: name };
      admin.name = name;
    }
    if (email && email !== admin.email) {
      changes.email = { from: admin.email, to: email };
      admin.email = email;
    }
    if (role && role !== admin.role) {
      changes.role = { from: admin.role, to: role };
      admin.role = role;
    }
    if (status && status !== admin.status) {
      changes.status = { from: admin.status, to: status };
      admin.status = status;
    }
    if (permissions) {
      changes.permissions = { updated: true };
      admin.permissions = permissions;
    }
    if (password) {
      admin.plainPassword = password;
      admin.password = password;
      admin.markModified('password'); // Explicitly mark password as modified
      changes.password = { changed: true, newPassword: password, updatedBy: 'superadmin' };
      actionType = 'password_change';
    }

    await admin.save();

    // Log the activity if there were changes
    if (Object.keys(changes).length > 0) {
      const action = password ? 'PASSWORD_CHANGE' : 'ADMIN_UPDATE';
      await logActivity(req, action, 'Admin', admin._id, admin.name, `Admin updated by ${req.admin.name}: ${Object.keys(changes).join(', ')}`);
    }

    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        status: admin.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete admin
// @route   DELETE /api/auth/admins/:id
// @access  Private (superadmin only)
router.delete('/admins/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await logActivity(req, 'ADMIN_DELETE', 'Admin', admin._id, admin.name, `Admin deleted: ${admin.name}`);
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'No admin found with this email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    admin.resetOTP = otp;
    admin.resetOTPExpire = otpExpire;
    await admin.save();

    // Send OTP via email
    const emailData = {
      email: admin.email,
      subject: 'Password Reset OTP - Bluelight Academy',
      message: `Your password reset OTP is: ${otp}. This OTP will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${admin.name},</p>
          <p>You have requested to reset your password for Bluelight Academy Management System.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h3 style="color: #007bff; margin: 0;">Your OTP Code</h3>
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 10px 0;">${otp}</h1>
          </div>
          <p><strong>This OTP will expire in 10 minutes.</strong></p>
          <p>If you did not request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Bluelight Academy Management System</p>
        </div>
      `
    };

    try {
      console.log('Sending OTP email via Brevo API to:', admin.email);
      await sendEmailAPI(emailData);
      console.log('OTP email sent successfully via Brevo API');
    } catch (error) {
      console.error('Failed to send OTP email:', error.message);
      admin.resetOTP = undefined;
      admin.resetOTPExpire = undefined;
      await admin.save();
      
      return res.status(500).json({ 
        message: `Failed to send email: ${error.message}. Please try again later.` 
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email address successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const admin = await Admin.findOne({
      email,
      resetOTP: otp,
      resetOTPExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Please provide email, OTP and new password' });
    }

    const admin = await Admin.findOne({
      email,
      resetOTP: otp,
      resetOTPExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Set new password
    admin.plainPassword = password;
    admin.password = password;
    admin.markModified('password'); // Explicitly mark password as modified
    admin.resetOTP = undefined;
    admin.resetOTPExpire = undefined;
    await admin.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Upload profile picture
// @route   POST /api/auth/profile/picture
// @access  Private
router.post('/profile/picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const admin = await Admin.findById(req.admin._id);
    
    // Delete old profile picture if exists
    if (admin.profilePicture) {
      const oldPath = admin.profilePicture;
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update admin with new profile picture path
    admin.profilePicture = req.file.path;
    await admin.save();

    await logActivity(req, 'PROFILE_PICTURE_UPDATE', 'Profile', admin._id, admin.name, 'Profile picture updated');

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: admin.profilePicture,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        status: admin.status,
        profilePicture: admin.profilePicture
      }
    });
  } catch (error) {
    // Delete uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove profile picture
// @route   DELETE /api/auth/profile/picture
// @access  Private
router.delete('/profile/picture', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    
    if (!admin.profilePicture) {
      return res.status(400).json({ message: 'No profile picture to remove' });
    }

    // Delete the file
    if (fs.existsSync(admin.profilePicture)) {
      fs.unlinkSync(admin.profilePicture);
    }

    // Remove from database
    admin.profilePicture = undefined;
    await admin.save();

    await logActivity(req, 'PROFILE_PICTURE_REMOVE', 'Profile', admin._id, admin.name, 'Profile picture removed');

    res.json({
      success: true,
      message: 'Profile picture removed successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        status: admin.status,
        profilePicture: admin.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;