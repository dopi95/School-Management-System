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
  const { isAuthenticated } = useAuth();

  // Load students when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('StudentsContext: User authenticated, loading students...');
      loadStudents();
    }
  }, [isAuthenticated]);

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
    
    // Check cache first for silent refreshes
    if (!showLoading) {
      const cached = sessionStorage.getItem('studentsCache');
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 120000) { // 2 minutes cache
            console.log('StudentsContext: Using cached data for silent refresh');
            return;
          }
        } catch (e) {}
      }
    }
    
    try {
      if (showLoading) setLoading(true);
      console.log('StudentsContext: Calling API to fetch students...');
      const students = await apiService.getStudents();
      console.log('StudentsContext: Received students from API:', students?.length || 0, students);
      
      const studentsArray = Array.isArray(students) ? students : [];
      
      // Update both individual cache and preloaded data
      sessionStorage.setItem('studentsCache', JSON.stringify({
        data: studentsArray,
        timestamp: Date.now()
      }));
      
      // Update preloaded data if it exists
      const preloaded = sessionStorage.getItem('preloadedData');
      if (preloaded) {
        try {
          const parsed = JSON.parse(preloaded);
          parsed.data.students = studentsArray;
          sessionStorage.setItem('preloadedData', JSON.stringify(parsed));
        } catch (e) {}
      }
      
      setStudentsList(studentsArray);
      console.log('StudentsContext: Students state updated, count:', studentsArray.length);
      setError(null);
    } catch (err) {
      console.error('StudentsContext: Failed to load students:', err);
      setError(err.message);
      setStudentsList([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const addStudent = async (studentData) => {
    try {
      const newStudent = await apiService.createStudent(studentData);
      const updatedList = [...studentsList, newStudent];
      setStudentsList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('studentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
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
      
      // Update cache immediately
      sessionStorage.setItem('studentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
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
      
      // Update cache immediately
      sessionStorage.setItem('studentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
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
      
      // Update cache immediately
      sessionStorage.setItem('studentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
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
      
      // Update cache immediately
      sessionStorage.setItem('studentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
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
      
      // Update cache immediately
      sessionStorage.setItem('studentsCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
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