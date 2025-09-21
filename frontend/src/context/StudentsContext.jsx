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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const students = await apiService.getStudents();
      setStudentsList(students);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
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