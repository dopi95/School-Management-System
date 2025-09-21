import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';

const EmployeesContext = createContext();

export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeesProvider');
  }
  return context;
};

export const EmployeesProvider = ({ children }) => {
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const employees = await apiService.getEmployees();
      setEmployeesList(employees);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      const newEmployee = await apiService.createEmployee(employeeData);
      setEmployeesList(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      const updatedEmployee = await apiService.updateEmployee(id, employeeData);
      setEmployeesList(prev => prev.map(employee => 
        employee.id === id ? updatedEmployee : employee
      ));
      return updatedEmployee;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEmployeeStatus = async (employeeId, status) => {
    try {
      const updatedEmployee = await apiService.updateEmployeeStatus(employeeId, status);
      setEmployeesList(prev => prev.map(employee => 
        employee.id === employeeId ? updatedEmployee : employee
      ));
      return updatedEmployee;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      await apiService.deleteEmployee(employeeId);
      setEmployeesList(prev => prev.filter(employee => employee.id !== employeeId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    employeesList,
    setEmployeesList,
    loading,
    error,
    loadEmployees,
    addEmployee,
    updateEmployee,
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