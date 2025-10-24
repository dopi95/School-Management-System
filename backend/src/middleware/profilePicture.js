import fs from 'fs';
import path from 'path';

/**
 * Middleware to ensure profile picture exists and is accessible
 */
export const validateProfilePicture = (req, res, next) => {
  if (req.admin && req.admin.profilePicture) {
    const picturePath = req.admin.profilePicture;
    
    // Check if file exists
    if (!fs.existsSync(picturePath)) {
      console.log(`Profile picture not found: ${picturePath}`);
      // Remove the invalid path from admin object
      req.admin.profilePicture = null;
    }
  }
  next();
};

/**
 * Utility function to clean up orphaned profile pictures
 */
export const cleanupOrphanedPictures = async () => {
  try {
    const uploadsDir = 'uploads/profiles';
    if (!fs.existsSync(uploadsDir)) {
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const Admin = (await import('../models/Admin.js')).default;
    
    // Get all profile pictures in use
    const admins = await Admin.find({ profilePicture: { $exists: true, $ne: null } });
    const usedPictures = admins.map(admin => admin.profilePicture);
    
    // Remove unused files
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const relativePath = `uploads/profiles/${file}`;
      
      if (!usedPictures.includes(relativePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up orphaned profile picture: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up orphaned pictures:', error);
  }
};