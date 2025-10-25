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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let dataLoaded = false;
    
    // Check for preloaded data first
    const preloaded = sessionStorage.getItem('preloadedData');
    if (preloaded) {
      try {
        const { data } = JSON.parse(preloaded);
        if (data.employees) {
          console.log('Loading employees from preloaded data:', data.employees.length);
          setEmployeesList(data.employees);
          dataLoaded = true;
        }
      } catch (e) {
        console.error('Error parsing preloaded data:', e);
      }
    }
    
    if (!dataLoaded) {
      // Fallback to individual cache
      const cached = sessionStorage.getItem('employeesCache');
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          if (data) {
            console.log('Loading employees from cache:', data.length);
            setEmployeesList(data);
            dataLoaded = true;
          }
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      }
    }
    
    // Always load from API to ensure fresh data
    if (!dataLoaded) {
      console.log('Loading employees from API');
      loadEmployees();
    } else {
      // Load fresh data in background
      setTimeout(() => loadEmployees(false), 1000);
    }
  }, []);

  // Set up refresh mechanisms
  useEffect(() => {
    if (isEditing) return;
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadEmployees(false);
      }
    };
    
    const refreshInterval = setInterval(() => {
      if (!document.hidden) {
        loadEmployees(false);
      }
    }, 120000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(refreshInterval);
    };
  }, [isEditing]);

  const loadEmployees = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const employees = await apiService.getEmployees();
      
      // Update both individual cache and preloaded data
      sessionStorage.setItem('employeesCache', JSON.stringify({
        data: employees,
        timestamp: Date.now()
      }));
      
      // Update preloaded data if it exists
      const preloaded = sessionStorage.getItem('preloadedData');
      if (preloaded) {
        try {
          const parsed = JSON.parse(preloaded);
          parsed.data.employees = employees;
          sessionStorage.setItem('preloadedData', JSON.stringify(parsed));
        } catch (e) {}
      }
      
      setEmployeesList(employees);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load employees:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      const newEmployee = await apiService.createEmployee(employeeData);
      const updatedList = [...employeesList, newEmployee];
      setEmployeesList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('employeesCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      return newEmployee;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      const updatedEmployee = await apiService.updateEmployee(id, employeeData);
      const updatedList = employeesList.map(employee => 
        employee.id === id ? updatedEmployee : employee
      );
      setEmployeesList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('employeesCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      return updatedEmployee;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEmployeeStatus = async (employeeId, status) => {
    try {
      const updatedEmployee = await apiService.updateEmployeeStatus(employeeId, status);
      const updatedList = employeesList.map(employee => 
        employee.id === employeeId ? updatedEmployee : employee
      );
      setEmployeesList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('employeesCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      return updatedEmployee;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      await apiService.deleteEmployee(employeeId);
      const updatedList = employeesList.filter(employee => employee.id !== employeeId);
      setEmployeesList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('employeesCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addEmployeeSalary = async (employeeId, year, monthlySalary) => {
    try {
      const updatedEmployee = await apiService.addEmployeeSalary(employeeId, year, monthlySalary);
      const updatedList = employeesList.map(employee => 
        employee.id === employeeId ? updatedEmployee : employee
      );
      setEmployeesList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('employeesCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      return updatedEmployee;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEmployeeSalary = async (employeeId, year, monthlySalary) => {
    try {
      const updatedEmployee = await apiService.updateEmployeeSalary(employeeId, year, monthlySalary);
      const updatedList = employeesList.map(employee => 
        employee.id === employeeId ? updatedEmployee : employee
      );
      setEmployeesList(updatedList);
      
      // Update cache immediately
      sessionStorage.setItem('employeesCache', JSON.stringify({
        data: updatedList,
        timestamp: Date.now()
      }));
      
      return updatedEmployee;
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
    isEditing,
    setIsEditing,
    loadEmployees,
    addEmployee,
    updateEmployee,
    updateEmployeeStatus,
    deleteEmployee,
    addEmployeeSalary,
    updateEmployeeSalary
  };

  return (
    <EmployeesContext.Provider value={value}>
      {children}
    </EmployeesContext.Provider>
  );
};

export default EmployeesContext;