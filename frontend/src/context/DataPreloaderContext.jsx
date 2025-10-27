import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const DataPreloaderContext = createContext();

export const useDataPreloader = () => {
  const context = useContext(DataPreloaderContext);
  if (!context) {
    throw new Error('useDataPreloader must be used within a DataPreloaderProvider');
  }
  return context;
};

export const DataPreloaderProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [preloadedData, setPreloadedData] = useState(() => {
    // Try to load cached data immediately
    try {
      const cached = sessionStorage.getItem('preloadedData');
      if (cached) {
        const { data } = JSON.parse(cached);
        return data;
      }
    } catch (e) {}
    
    return {
      students: [],
      specialStudents: [],
      employees: [],
      admins: [],
      pendingStudents: []
    };
  });

  const preloadAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel for maximum speed
      const promises = [
        apiService.getStudents().then(res => Array.isArray(res) ? res : []).catch(() => []),
        apiService.getSpecialStudents().then(res => Array.isArray(res) ? res : []).catch(() => []),
        apiService.getEmployees().then(res => Array.isArray(res) ? res : []).catch(() => []),
        apiService.getAdmins().then(res => Array.isArray(res?.admins) ? res.admins : []).catch(() => []),
        apiService.request('/pending-students').then(res => Array.isArray(res) ? res : []).catch(() => [])
      ];
      
      const [
        students,
        specialStudents,
        employees,
        admins,
        pendingStudents
      ] = await Promise.all(promises);

      const data = {
        students: students || [],
        specialStudents: specialStudents || [],
        employees: employees || [],
        admins: admins || [],
        pendingStudents: pendingStudents || []
      };

      setPreloadedData(data);
      
      // Cache in sessionStorage for instant subsequent loads
      sessionStorage.setItem('preloadedData', JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      return data;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPreloadedData = (type) => {
    return preloadedData[type] || [];
  };

  const updatePreloadedData = (type, data) => {
    const newData = {
      ...preloadedData,
      [type]: data
    };
    setPreloadedData(newData);
    
    // Update cache immediately
    sessionStorage.setItem('preloadedData', JSON.stringify({
      data: newData,
      timestamp: Date.now()
    }));
  };

  // Auto-preload when authenticated
  React.useEffect(() => {
    if (isAuthenticated && localStorage.getItem('token')) {
      preloadAllData();
    }
  }, [isAuthenticated]);

  // Auto-preload on mount if cached data exists
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const cached = sessionStorage.getItem('preloadedData');
      if (!cached) {
        preloadAllData();
      }
    }
  }, []);

  const value = {
    isLoading,
    preloadedData,
    preloadAllData,
    getPreloadedData,
    updatePreloadedData
  };

  return (
    <DataPreloaderContext.Provider value={value}>
      {children}
    </DataPreloaderContext.Provider>
  );
};

export default DataPreloaderContext;