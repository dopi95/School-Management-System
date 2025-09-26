export const checkPermission = (section, action = 'read') => {
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
    
    // Users can only read, not modify
    if (admin.role === 'user' && action !== 'read') {
      const writeActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
      if (writeActions.includes(req.method)) {
        return res.status(403).json({ 
          message: 'Access denied. Users can only view data, not modify it.' 
        });
      }
    }
    
    next();
  };
};

export const checkWritePermission = (section) => {
  return checkPermission(section, 'write');
};