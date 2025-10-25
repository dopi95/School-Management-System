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
    let dataLoaded = false;
    
    // Check for preloaded data first
    const preloaded = sessionStorage.getItem('preloadedData');
    if (preloaded) {
      try {
        const { data } = JSON.parse(preloaded);
        if (data.students) {
          console.log('Loading students from preloaded data:', data.students.length);
          setStudentsList(data.students);
          dataLoaded = true;
        }
      } catch (e) {
        console.error('Error parsing preloaded data:', e);
      }
    }
    
    if (!dataLoaded) {
      // Fallback to individual cache
      const cached = sessionStorage.getItem('studentsCache');
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          if (data) {
            console.log('Loading students from cache:', data.length);
            setStudentsList(data);
            dataLoaded = true;
          }
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      }
    }
    
    // Always load from API to ensure fresh data
    if (!dataLoaded) {
      console.log('Loading students from API');
      loadStudents();
    } else {
      // Load fresh data in background
      setTimeout(() => loadStudents(false), 1000);
    }
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
      
      // Update both individual cache and preloaded data
      sessionStorage.setItem('studentsCache', JSON.stringify({
        data: students,
        timestamp: Date.now()
      }));
      
      // Update preloaded data if it exists
      const preloaded = sessionStorage.getItem('preloadedData');
      if (preloaded) {
        try {
          const parsed = JSON.parse(preloaded);
          parsed.data.students = students;
          sessionStorage.setItem('preloadedData', JSON.stringify(parsed));
        } catch (e) {}
      }
      
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