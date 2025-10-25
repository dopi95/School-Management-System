import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';

const SpecialStudentsContext = createContext();

export const useSpecialStudents = () => {
  const context = useContext(SpecialStudentsContext);
  if (!context) {
    throw new Error('useSpecialStudents must be used within a SpecialStudentsProvider');
  }
  return context;
};

export const SpecialStudentsProvider = ({ children }) => {
  const [specialStudentsList, setSpecialStudentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load special students immediately
  useEffect(() => {
    // Check for preloaded data first
    const preloaded = sessionStorage.getItem('preloadedData');
    if (preloaded) {
      try {
        const { data, timestamp } = JSON.parse(preloaded);
        // Check if cache is still valid (within 5 minutes)
        if (data.specialStudents && Date.now() - timestamp < 300000) {
          setSpecialStudentsList(data.specialStudents);
          return;
        }
      } catch (e) {}
    }
    
    // Fallback to individual cache
    const cached = sessionStorage.getItem('specialStudentsCache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid (within 5 minutes)
        if (data && Date.now() - timestamp < 300000) {
          setSpecialStudentsList(data);
          return;
        }
      } catch (e) {}
    }
    
    // Load from API if no cache or cache is expired
    loadSpecialStudents();
  }, []);

  // Set up refresh mechanisms only when not editing
  useEffect(() => {
    if (isEditing) return;
    
    // Refresh data when page becomes visible (switching between devices/tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadSpecialStudents(false); // Silent refresh
      }
    };
    
    // Set up periodic refresh every 2 minutes (more frequent for better sync)
    const refreshInterval = setInterval(() => {
      if (!document.hidden) {
        loadSpecialStudents(false); // Silent refresh
      }
    }, 120000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(refreshInterval);
    };
  }, [isEditing]);

  const loadSpecialStudents = async (showLoading = true) => {
    if (isEditing && !showLoading) return; // Don't refresh while editing
    try {
      if (showLoading) setLoading(true);
      const students = await apiService.getSpecialStudents();
      
      // Cache special students data in sessionStorage for faster subsequent loads
      sessionStorage.setItem('specialStudentsCache', JSON.stringify({
        data: students,
        timestamp: Date.now()
      }));
      
      // Update preloaded data cache if it exists
      const preloaded = sessionStorage.getItem('preloadedData');
      if (preloaded) {
        try {
          const { data } = JSON.parse(preloaded);
          data.specialStudents = students;
          sessionStorage.setItem('preloadedData', JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {}
      }
      
      setSpecialStudentsList(students);
      console.log('Special students loaded:', students.length, students);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load special students:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const addSpecialStudent = async (studentData) => {
    try {
      const newStudent = await apiService.createSpecialStudent(studentData);
      setSpecialStudentsList(prev => [...prev, newStudent]);
      
      const updatedList = [...specialStudentsList, newStudent];
      
      // Update cache immediately
      sessionStorage.setItem('specialStudentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      // Update preloaded data cache if it exists
      const preloaded = sessionStorage.getItem('preloadedData');
      if (preloaded) {
        try {
          const { data } = JSON.parse(preloaded);
          data.specialStudents = updatedList;
          sessionStorage.setItem('preloadedData', JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {}
      }
      
      return newStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSpecialStudent = async (id, studentData) => {
    try {
      const updatedStudent = await apiService.updateSpecialStudent(id, studentData);
      const updatedList = specialStudentsList.map(student => 
        student.id === id ? updatedStudent : student
      );
      setSpecialStudentsList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('specialStudentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      // Update preloaded data cache if it exists
      const preloaded = sessionStorage.getItem('preloadedData');
      if (preloaded) {
        try {
          const { data } = JSON.parse(preloaded);
          data.specialStudents = updatedList;
          sessionStorage.setItem('preloadedData', JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {}
      }
      
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSpecialStudentStatus = async (studentId, status) => {
    try {
      const updatedStudent = await apiService.updateSpecialStudentStatus(studentId, status);
      const updatedList = specialStudentsList.map(student => 
        student.id === studentId ? updatedStudent : student
      );
      setSpecialStudentsList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('specialStudentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      // Update preloaded data cache if it exists
      const preloaded = sessionStorage.getItem('preloadedData');
      if (preloaded) {
        try {
          const { data } = JSON.parse(preloaded);
          data.specialStudents = updatedList;
          sessionStorage.setItem('preloadedData', JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {}
      }
      
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSpecialStudentPayment = async (studentId, monthKey, paymentData) => {
    try {
      const updatedStudent = await apiService.updateSpecialStudentPayment(studentId, monthKey, paymentData);
      setSpecialStudentsList(prev => prev.map(student => 
        student.id === studentId ? updatedStudent : student
      ));
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSpecialStudent = async (studentId) => {
    try {
      await apiService.deleteSpecialStudent(studentId);
      const updatedList = specialStudentsList.filter(student => student.id !== studentId);
      setSpecialStudentsList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('specialStudentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      // Update preloaded data cache if it exists
      const preloaded = sessionStorage.getItem('preloadedData');
      if (preloaded) {
        try {
          const { data } = JSON.parse(preloaded);
          data.specialStudents = updatedList;
          sessionStorage.setItem('preloadedData', JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {}
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const bulkUpdateSpecialStudents = async (studentIds, updates) => {
    try {
      const updatedStudents = await apiService.bulkUpdateSpecialStudents(studentIds, updates);
      const updatedList = specialStudentsList.map(student => {
        const updatedStudent = updatedStudents.find(u => u.id === student.id);
        return updatedStudent || student;
      });
      setSpecialStudentsList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('specialStudentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      // Update preloaded data cache if it exists
      const preloaded = sessionStorage.getItem('preloadedData');
      if (preloaded) {
        try {
          const { data } = JSON.parse(preloaded);
          data.specialStudents = updatedList;
          sessionStorage.setItem('preloadedData', JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {}
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    specialStudentsList,
    setSpecialStudentsList,
    loading,
    error,
    isEditing,
    setIsEditing,
    loadSpecialStudents,
    addSpecialStudent,
    updateSpecialStudent,
    updateSpecialStudentStatus,
    updateSpecialStudentPayment,
    deleteSpecialStudent,
    bulkUpdateSpecialStudents
  };

  return (
    <SpecialStudentsContext.Provider value={value}>
      {children}
    </SpecialStudentsContext.Provider>
  );
};

export default SpecialStudentsContext;