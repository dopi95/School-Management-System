import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AccessDenied from '../pages/AccessDenied.jsx';

const ProtectedRoute = ({ children, permission, section }) => {
  const { admin } = useAuth();
  
  // Superadmin has access to everything
  if (admin?.role === 'superadmin') {
    return children;
  }
  
  // Check if admin has the required permission
  if (admin?.permissions?.[permission]) {
    return children;
  }
  
  // Show access denied page
  return <AccessDenied section={section} />;
};

export default ProtectedRoute;