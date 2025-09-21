export const checkPermission = (section) => {
  return (req, res, next) => {
    const admin = req.admin;
    
    // Superadmin has access to everything
    if (admin.role === 'superadmin') {
      return next();
    }
    
    // Check if admin has permission for this section
    if (!admin.permissions || !admin.permissions[section]) {
      return res.status(403).json({ 
        message: `Access denied. You don't have permission to access ${section}.` 
      });
    }
    
    next();
  };
};