import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDataPreloader } from '../context/DataPreloaderContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';
import { useEmployees } from '../context/EmployeesContext.jsx';

const DataLoader = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { preloadAllData } = useDataPreloader();
  const { loadStudents } = useStudents();
  const { loadEmployees } = useEmployees();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, forcing data load...');
      // Force immediate data loading
      preloadAllData();
      loadStudents();
      loadEmployees();
    }
  }, [isAuthenticated]);

  return children;
};

export default DataLoader;