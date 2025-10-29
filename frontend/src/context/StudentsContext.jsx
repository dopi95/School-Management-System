import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const StudentsContext = createContext();

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};

export const StudentsProvider = ({ children }) => {
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('token') && !hasLoaded) {
      loadStudents();
    }
  }, [isAuthenticated, hasLoaded]);

  useEffect(() => {
    if (isEditing) return;
    
    const handleVisibilityChange = () => {
      if (!document.hidden && localStorage.getItem('token')) {
        loadStudents(false, true);
      }
    };
    
    // Reduced refresh interval from 2 minutes to 5 minutes
    const refreshInterval = setInterval(() => {
      if (!document.hidden && localStorage.getItem('token') && !isEditing) {
        loadStudents(false, true);
      }
    }, 300000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(refreshInterval);
    };
  }, [isEditing]);

  const loadStudents = async (showLoading = true, forceReload = false) => {
    if (isEditing && !showLoading) return;
    if (!localStorage.getItem('token')) return;
    if (hasLoaded && !forceReload) return;
    
    try {
      if (showLoading) setLoading(true);
      const students = await apiService.getStudents();
      setStudentsList(students || []);
      setHasLoaded(true);
      setError(null);
    } catch (err) {
      console.error('StudentsContext: Error loading students:', err);
      setError(err.message);
      setStudentsList([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const addStudent = async (studentData) => {
    try {
      const newStudent = await apiService.createStudent(studentData);
      setStudentsList([...studentsList, newStudent]);
      apiService.invalidateCache('students');
      return newStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateStudent = async (id, studentData) => {
    try {
      const updatedStudent = await apiService.updateStudent(id, studentData);
      const updatedList = studentsList.map(student => 
        student.id === id ? updatedStudent : student
      );
      setStudentsList(updatedList);
      apiService.invalidateCache('students');
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateStudentStatus = async (studentId, status) => {
    try {
      const updatedStudent = await apiService.updateStudentStatus(studentId, status);
      const updatedList = studentsList.map(student => 
        student.id === studentId ? updatedStudent : student
      );
      setStudentsList(updatedList);
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateStudentPayment = async (studentId, monthKey, paymentData) => {
    try {
      const updatedStudent = await apiService.updateStudentPayment(studentId, monthKey, paymentData);
      const updatedList = studentsList.map(student => 
        student.id === studentId ? updatedStudent : student
      );
      setStudentsList(updatedList);
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      await apiService.deleteStudent(studentId);
      const updatedList = studentsList.filter(student => student.id !== studentId);
      setStudentsList(updatedList);
      apiService.invalidateCache('students');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const bulkUpdateStudents = async (studentIds, updates) => {
    try {
      const updatedStudents = await apiService.bulkUpdateStudents(studentIds, updates);
      const updatedList = studentsList.map(student => {
        const updatedStudent = updatedStudents.find(u => u.id === student.id);
        return updatedStudent || student;
      });
      setStudentsList(updatedList);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    studentsList,
    setStudentsList,
    loading,
    error,
    isEditing,
    setIsEditing,
    hasLoaded,
    loadStudents,
    addStudent,
    updateStudent,
    updateStudentStatus,
    updateStudentPayment,
    deleteStudent,
    bulkUpdateStudents
  };

  return (
    <StudentsContext.Provider value={value}>
      {children}
    </StudentsContext.Provider>
  );
};

export default StudentsContext;