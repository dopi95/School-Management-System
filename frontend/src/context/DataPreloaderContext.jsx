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
      console.log('Starting data preload...');
      
      // Fetch all data in parallel for maximum speed
      const promises = [
        apiService.getStudents().catch(err => { console.error('Students fetch failed:', err); return []; }),
        apiService.getSpecialStudents().catch(err => { console.error('Special students fetch failed:', err); return []; }),
        apiService.getEmployees().catch(err => { console.error('Employees fetch failed:', err); return []; }),
        apiService.getAdmins().then(res => res.admins || []).catch(err => { console.error('Admins fetch failed:', err); return []; }),
        apiService.request('/pending-students').catch(err => { console.error('Pending students fetch failed:', err); return []; })
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

      console.log('Data preloaded successfully:', {
        students: data.students.length,
        specialStudents: data.specialStudents.length,
        employees: data.employees.length,
        admins: data.admins.length,
        pendingStudents: data.pendingStudents.length
      });

      setPreloadedData(data);
      
      // Cache in sessionStorage for instant subsequent loads
      sessionStorage.setItem('preloadedData', JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      return data;
    } catch (error) {
      console.error('Error preloading data:', error);
      return null;
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

  // Auto-preload on mount if no cached data exists
  React.useEffect(() => {
    const cached = sessionStorage.getItem('preloadedData');
    if (!cached) {
      console.log('No cached data found, preloading...');
      preloadAllData();
    } else {
      console.log('Using cached preloaded data');
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