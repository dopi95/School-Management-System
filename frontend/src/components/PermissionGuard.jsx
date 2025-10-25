import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const PermissionGuard = ({ permission, action, children, fallback = null }) => {
  const { admin } = useAuth();
  
  // Superadmin has access to everything
  if (admin?.role === 'superadmin') {
    return children;
  }
  
  // Check if admin has the required permission
  if (action) {
    // Check action-level permission (e.g., students.create)
    if (admin?.permissions?.[permission]?.[action]) {
      return children;
    }
  } else {
    // Check module-level permission (for simple boolean permissions)
    if (admin?.permissions?.[permission]) {
      return children;
    }
  }
  
  // Return fallback component or null if no access
  return fallback;
};

export default PermissionGuard;