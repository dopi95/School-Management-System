import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

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
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('token')) {
      loadSpecialStudents();
    }
  }, [isAuthenticated]);

  // Set up refresh mechanisms only when not editing
  useEffect(() => {
    if (isEditing) return;
    
    // Refresh data when page becomes visible (switching between devices/tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden && localStorage.getItem('token')) {
        loadSpecialStudents(false); // Silent refresh
      }
    };
    
    // Set up periodic refresh every 2 minutes (more frequent for better sync)
    const refreshInterval = setInterval(() => {
      if (!document.hidden && localStorage.getItem('token')) {
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
    if (isEditing && !showLoading) return;
    try {
      if (showLoading) setLoading(true);
      const students = await apiService.getSpecialStudents();
      setSpecialStudentsList(students);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadSpecialStudentsFull = async () => {
    if (!localStorage.getItem('token')) return [];
    
    try {
      const students = await apiService.getSpecialStudentsFull();
      return students || [];
    } catch (err) {
      console.error('SpecialStudentsContext: Error loading full special students:', err);
      return [];
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
      const updatedList = specialStudentsList.map(student => 
        student.id === id ? updatedStudent : student
      );
      setSpecialStudentsList(updatedList);
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
    loadSpecialStudentsFull,
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