import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.getAdmins();
      if (response.success) {
        setAdminsList(response.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
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