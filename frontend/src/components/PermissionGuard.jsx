import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const PermissionGuard = ({ permission, children, fallback = null }) => {
  const { admin } = useAuth();
  
  // Superadmin has access to everything
  if (admin?.role === 'superadmin') {
    return children;
  }
  
  // Check if admin has the required permission
  if (admin?.permissions?.[permission]) {
    return children;
  }
  
  // Return fallback component or null if no access
  return fallback;
};

export default PermissionGuard;