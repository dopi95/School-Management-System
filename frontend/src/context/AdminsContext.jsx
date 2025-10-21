import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const AdminsContext = createContext();

export const useAdmins = () => {
  const context = useContext(AdminsContext);
  if (!context) {
    throw new Error('useAdmins must be used within an AdminsProvider');
  }
  return context;
};

export const AdminsProvider = ({ children }) => {
  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, admin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading && admin) {
      const hasAdminsAccess = admin.role === 'superadmin' || admin.permissions?.admins;
      if (hasAdminsAccess) {
        fetchAdmins();
      } else {
        setLoading(false);
      }
    } else if (!authLoading && !isAuthenticated) {
      setAdminsList([]);
      setLoading(false);
    }
  }, [isAuthenticated, admin, authLoading]);

  const fetchAdmins = async () => {
    if (loading) return; // Prevent multiple simultaneous requests
    setLoading(true);
    try {
      const response = await api.getAdmins();
      if (response.success) {
        setAdminsList(response.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdminsList([]);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    adminsList,
    loading,
    fetchAdmins
  };

  return (
    <AdminsContext.Provider value={value}>
      {children}
    </AdminsContext.Provider>
  );
};