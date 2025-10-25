import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDataPreloader } from '../context/DataPreloaderContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';
import { useSpecialStudents } from '../context/SpecialStudentsContext.jsx';
import { useEmployees } from '../context/EmployeesContext.jsx';

const DataLoader = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { preloadAllData } = useDataPreloader();
  const { loadStudents } = useStudents();
  const { loadSpecialStudents } = useSpecialStudents();
  const { loadEmployees } = useEmployees();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, forcing data load...');
      // Force immediate data loading
      preloadAllData();
      loadStudents();
      loadSpecialStudents();
      loadEmployees();
    }
  }, [isAuthenticated]);

  return children;
};

export default DataLoader;