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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load special students on mount with cache check
  useEffect(() => {
    // Check for cached data first
    const cached = sessionStorage.getItem('specialStudentsCache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Use cache if less than 2 minutes old
        if (Date.now() - timestamp < 120000) {
          setSpecialStudentsList(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Invalid cache, proceed with normal load
      }
    }
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
    
    // Set up periodic refresh every 5 minutes (much less frequent)
    const refreshInterval = setInterval(() => {
      if (!document.hidden) {
        loadSpecialStudents(false); // Silent refresh
      }
    }, 300000);
    
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
      setSpecialStudentsList(students);
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
      return newStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSpecialStudent = async (id, studentData) => {
    try {
      const updatedStudent = await apiService.updateSpecialStudent(id, studentData);
      setSpecialStudentsList(prev => prev.map(student => 
        student.id === id ? updatedStudent : student
      ));
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSpecialStudentStatus = async (studentId, status) => {
    try {
      const updatedStudent = await apiService.updateSpecialStudentStatus(studentId, status);
      setSpecialStudentsList(prev => prev.map(student => 
        student.id === studentId ? updatedStudent : student
      ));
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
      setSpecialStudentsList(prev => prev.filter(student => student.id !== studentId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const bulkUpdateSpecialStudents = async (studentIds, updates) => {
    try {
      const updatedStudents = await apiService.bulkUpdateSpecialStudents(studentIds, updates);
      setSpecialStudentsList(prev => prev.map(student => {
        const updatedStudent = updatedStudents.find(u => u.id === student.id);
        return updatedStudent || student;
      }));
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