import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';

const DataPreloaderContext = createContext();

export const useDataPreloader = () => {
  const context = useContext(DataPreloaderContext);
  if (!context) {
    throw new Error('useDataPreloader must be used within a DataPreloaderProvider');
  }
  return context;
};

export const DataPreloaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preloadedData, setPreloadedData] = useState({
    students: [],
    specialStudents: [],
    employees: [],
    admins: [],
    pendingStudents: []
  });

  const preloadAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel for maximum speed
      const [
        students,
        specialStudents,
        employees,
        admins,
        pendingStudents
      ] = await Promise.all([
        apiService.getStudents().catch(() => []),
        apiService.getSpecialStudents().catch(() => []),
        apiService.getEmployees().catch(() => []),
        apiService.getAdmins().then(res => res.admins || []).catch(() => []),
        apiService.request('/pending-students').catch(() => [])
      ]);

      const data = {
        students,
        specialStudents,
        employees,
        admins,
        pendingStudents
      };

      setPreloadedData(data);
      
      // Cache in sessionStorage for instant subsequent loads
      sessionStorage.setItem('preloadedData', JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      return data;
    } catch (error) {
      console.error('Error preloading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPreloadedData = (type) => {
    return preloadedData[type] || [];
  };

  const updatePreloadedData = (type, data) => {
    setPreloadedData(prev => ({
      ...prev,
      [type]: data
    }));
  };

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