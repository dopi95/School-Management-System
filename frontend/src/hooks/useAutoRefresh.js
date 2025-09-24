import { useEffect, useCallback } from 'react';
import { useStudents } from '../context/StudentsContext.jsx';
import { useSpecialStudents } from '../context/SpecialStudentsContext.jsx';
import { useEmployees } from '../context/EmployeesContext.jsx';
import { usePayments } from '../context/PaymentsContext.jsx';
import { useSpecialPayments } from '../context/SpecialPaymentsContext.jsx';

const useAutoRefresh = (interval = 10000) => {
  const { fetchStudents } = useStudents();
  const { fetchSpecialStudents } = useSpecialStudents();
  const { fetchEmployees } = useEmployees();
  const { fetchPayments } = usePayments();
  const { fetchSpecialPayments } = useSpecialPayments();

  const refreshAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchStudents(),
        fetchSpecialStudents(),
        fetchEmployees(),
        fetchPayments(),
        fetchSpecialPayments()
      ]);
    } catch (error) {
      // Silent refresh - don't show errors
    }
  }, [fetchStudents, fetchSpecialStudents, fetchEmployees, fetchPayments, fetchSpecialPayments]);

  useEffect(() => {
    const timer = setInterval(refreshAllData, interval);
    return () => clearInterval(timer);
  }, [refreshAllData, interval]);
};

export default useAutoRefresh;