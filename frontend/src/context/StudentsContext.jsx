import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';

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

  // Load students immediately
  useEffect(() => {
    // Check for preloaded data first
    const preloaded = sessionStorage.getItem('preloadedData');
    if (preloaded) {
      try {
        const { data } = JSON.parse(preloaded);
        if (data.students) {
          setStudentsList(data.students);
          return;
        }
      } catch (e) {}
    }
    
    // Fallback to individual cache
    const cached = sessionStorage.getItem('studentsCache');
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        setStudentsList(data);
        return;
      } catch (e) {}
    }
    
    // Load from API if no cache
    loadStudents();
  }, []);

  // Set up refresh mechanisms only when not editing
  useEffect(() => {
    if (isEditing) return;
    
    // Refresh data when page becomes visible (switching between devices/tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadStudents(false); // Silent refresh
      }
    };
    
    // Set up periodic refresh every 2 minutes (more frequent for better sync)
    const refreshInterval = setInterval(() => {
      if (!document.hidden) {
        loadStudents(false); // Silent refresh
      }
    }, 120000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(refreshInterval);
    };
  }, [isEditing]);

  const loadStudents = async (showLoading = true) => {
    if (isEditing && !showLoading) return;
    try {
      if (showLoading) setLoading(true);
      const students = await apiService.getStudents();
      sessionStorage.setItem('studentsCache', JSON.stringify({
        data: students,
        timestamp: Date.now()
      }));
      setStudentsList(students);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load students:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const addStudent = async (studentData) => {
    try {
      const newStudent = await apiService.createStudent(studentData);
      setStudentsList(prev => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateStudent = async (id, studentData) => {
    try {
      const updatedStudent = await apiService.updateStudent(id, studentData);
      setStudentsList(prev => prev.map(student => 
        student.id === id ? updatedStudent : student
      ));
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateStudentStatus = async (studentId, status) => {
    try {
      const updatedStudent = await apiService.updateStudentStatus(studentId, status);
      setStudentsList(prev => prev.map(student => 
        student.id === studentId ? updatedStudent : student
      ));
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateStudentPayment = async (studentId, monthKey, paymentData) => {
    try {
      const updatedStudent = await apiService.updateStudentPayment(studentId, monthKey, paymentData);
      setStudentsList(prev => prev.map(student => 
        student.id === studentId ? updatedStudent : student
      ));
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      await apiService.deleteStudent(studentId);
      setStudentsList(prev => prev.filter(student => student.id !== studentId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const bulkUpdateStudents = async (studentIds, updates) => {
    try {
      const updatedStudents = await apiService.bulkUpdateStudents(studentIds, updates);
      setStudentsList(prev => prev.map(student => {
        const updatedStudent = updatedStudents.find(u => u.id === student.id);
        return updatedStudent || student;
      }));
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