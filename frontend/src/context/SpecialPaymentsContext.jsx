import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';

const SpecialPaymentsContext = createContext();

export const useSpecialPayments = () => {
  const context = useContext(SpecialPaymentsContext);
  if (!context) {
    throw new Error('useSpecialPayments must be used within a SpecialPaymentsProvider');
  }
  return context;
};

export const SpecialPaymentsProvider = ({ children }) => {
  const [specialPaymentsList, setSpecialPaymentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load special payments on mount
  useEffect(() => {
    loadSpecialPayments();
  }, []);

  const loadSpecialPayments = async () => {
    try {
      setLoading(true);
      const payments = await apiService.getSpecialPayments();
      setSpecialPaymentsList(payments);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load special payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialPayments = async () => {
    try {
      const payments = await apiService.getSpecialPayments();
      setSpecialPaymentsList(payments);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh special payments:', err);
    }
  };

  const addSpecialPayment = async (paymentData) => {
    try {
      const newPayment = await apiService.createSpecialPayment(paymentData);
      setSpecialPaymentsList(prev => [newPayment, ...prev]);
      return newPayment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSpecialPayment = async (id, paymentData) => {
    try {
      const updatedPayment = await apiService.updateSpecialPayment(id, paymentData);
      setSpecialPaymentsList(prev => prev.map(payment => 
        payment.id === id ? updatedPayment : payment
      ));
      return updatedPayment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSpecialPayment = async (paymentId) => {
    try {
      await apiService.deleteSpecialPayment(paymentId);
      setSpecialPaymentsList(prev => prev.filter(payment => payment.id !== paymentId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getSpecialStudentPayments = async (studentId) => {
    try {
      const payments = await apiService.getSpecialStudentPayments(studentId);
      return payments;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    specialPaymentsList,
    setSpecialPaymentsList,
    loading,
    error,
    loadSpecialPayments,
    fetchSpecialPayments,
    addSpecialPayment,
    updateSpecialPayment,
    deleteSpecialPayment,
    getSpecialStudentPayments
  };

  return (
    <SpecialPaymentsContext.Provider value={value}>
      {children}
    </SpecialPaymentsContext.Provider>
  );
};

export default SpecialPaymentsContext;