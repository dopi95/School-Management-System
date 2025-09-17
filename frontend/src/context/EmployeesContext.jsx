import React, { createContext, useContext, useState } from 'react';

const EmployeesContext = createContext();

export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeesProvider');
  }
  return context;
};

export const EmployeesProvider = ({ children }) => {
  const [employeesList, setEmployeesList] = useState([
    { id: 'E001', name: 'Dr. Sarah Connor', phone: '+251911234567', email: 'sarah@school.com', role: 'Teacher', classes: ['KG-1', 'KG-2'], qualification: 'PhD Education', experience: '10', address: 'Addis Ababa', status: 'active' },
    { id: 'E002', name: 'Mr. John Doe', phone: '+251922345678', email: 'john@school.com', role: 'Teacher', classes: ['KG-3'], qualification: 'Masters', experience: '5', address: 'Addis Ababa', status: 'active' },
    { id: 'E003', name: 'Ms. Jane Smith', phone: '+251933456789', email: 'jane@school.com', role: 'Assistant', classes: [], qualification: 'Bachelor', experience: '3', address: 'Addis Ababa', status: 'active' },
    { id: 'E004', name: 'Prof. Mike Johnson', phone: '+251944567890', email: 'mike@school.com', role: 'Principal', classes: [], qualification: 'PhD', experience: '15', address: 'Addis Ababa', status: 'active' },
    { id: 'E005', name: 'Dr. Emily Davis', phone: '+251955678901', email: 'emily@school.com', role: 'Teacher', classes: ['KG-1'], qualification: 'Masters', experience: '8', address: 'Addis Ababa', status: 'active' }
  ]);

  const updateEmployeeStatus = (employeeId, status) => {
    setEmployeesList(prev => prev.map(employee => 
      employee.id === employeeId 
        ? { ...employee, status }
        : employee
    ));
  };

  const deleteEmployee = (employeeId) => {
    setEmployeesList(prev => prev.filter(employee => employee.id !== employeeId));
  };

  const value = {
    employeesList,
    setEmployeesList,
    updateEmployeeStatus,
    deleteEmployee
  };

  return (
    <EmployeesContext.Provider value={value}>
      {children}
    </EmployeesContext.Provider>
  );
};

export default EmployeesContext;