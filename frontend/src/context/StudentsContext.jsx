import React, { createContext, useContext, useState } from 'react';

const StudentsContext = createContext();

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};

export const StudentsProvider = ({ children }) => {
  const [studentsList, setStudentsList] = useState([
    { id: 'ST001', name: 'Alice Johnson', phone: '+251911234567', class: 'KG-1', status: 'active', payments: {} },
    { id: 'ST002', name: 'Bob Smith', phone: '+251922345678', class: 'KG-2', status: 'active', payments: {} },
    { id: 'ST003', name: 'Carol Davis', phone: '+251933456789', class: 'KG-3', status: 'active', payments: {} },
    { id: 'ST004', name: 'David Wilson', phone: '+251944567890', class: 'KG-1', status: 'active', payments: {} },
    { id: 'ST005', name: 'Eva Brown', phone: '+251955678901', class: 'KG-2', status: 'active', payments: {} },
    { id: 'ST006', name: 'Frank Miller', phone: '+251966789012', class: 'KG-3', status: 'active', payments: {} }
  ]);

  const updateStudentStatus = (studentId, status) => {
    setStudentsList(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, status }
        : student
    ));
  };

  const updateStudentPayment = (studentId, monthKey, paymentData) => {
    setStudentsList(prev => prev.map(student => 
      student.id === studentId 
        ? {
            ...student,
            payments: {
              ...student.payments,
              [monthKey]: paymentData
            }
          }
        : student
    ));
  };

  const deleteStudent = (studentId) => {
    setStudentsList(prev => prev.filter(student => student.id !== studentId));
  };

  const value = {
    studentsList,
    setStudentsList,
    updateStudentStatus,
    updateStudentPayment,
    deleteStudent
  };

  return (
    <StudentsContext.Provider value={value}>
      {children}
    </StudentsContext.Provider>
  );
};

export default StudentsContext;