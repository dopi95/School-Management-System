export const checkPermission = (section, action = 'view') => {
  return (req, res, next) => {
    const admin = req.admin;
    
    // Superadmin has access to everything
    if (admin.role === 'superadmin') {
      return next();
    }
    
    // Map HTTP methods to actions
    const methodToAction = {
      'GET': 'view',
      'POST': 'create',
      'PUT': 'edit',
      'PATCH': 'edit',
      'DELETE': 'delete'
    };
    
    const requiredAction = action || methodToAction[req.method] || 'view';
    
    // Check if admin has permission for this section
    if (!admin.permissions || !admin.permissions[section]) {
      return res.status(403).json({ 
        message: `Access denied. You don't have permission to access ${section}.` 
      });
    }
    
    // For granular permissions (object with actions)
    if (typeof admin.permissions[section] === 'object' && admin.permissions[section] !== null) {
      if (!admin.permissions[section][requiredAction]) {
        return res.status(403).json({ 
          message: `Access denied. You don't have permission to ${requiredAction} in ${section}.` 
        });
      }
    }
    // For simple boolean permissions (backwards compatibility)
    else if (!admin.permissions[section]) {
      return res.status(403).json({ 
        message: `Access denied. You don't have permission to access ${section}.` 
      });
    }
    
    next();
  };
};

export const checkWritePermission = (section) => {
  return checkPermission(section, 'edit');
};

export const checkCreatePermission = (section) => {
  return checkPermission(section, 'create');
};

export const checkDeletePermission = (section) => {
  return checkPermission(section, 'delete');
};