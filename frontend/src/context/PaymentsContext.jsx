import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const PaymentsContext = createContext();

export const usePayments = () => {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error('usePayments must be used within a PaymentsProvider');
  }
  return context;
};

export const PaymentsProvider = ({ children }) => {
  const [paymentsList, setPaymentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadPayments();
    }
  }, [isAuthenticated]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const payments = await apiService.getPayments();
      setPaymentsList(payments);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const payments = await apiService.getPayments();
      setPaymentsList(payments);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh payments:', err);
    }
  };

  const addPayment = async (paymentData) => {
    try {
      const newPayment = await apiService.createPayment(paymentData);
      setPaymentsList(prev => [newPayment, ...prev]);
      return newPayment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePayment = async (id, paymentData) => {
    try {
      const updatedPayment = await apiService.updatePayment(id, paymentData);
      setPaymentsList(prev => prev.map(payment => 
        payment.id === id ? updatedPayment : payment
      ));
      return updatedPayment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deletePayment = async (paymentId) => {
    try {
      await apiService.deletePayment(paymentId);
      setPaymentsList(prev => prev.filter(payment => payment.id !== paymentId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getStudentPayments = async (studentId) => {
    try {
      return await apiService.getStudentPayments(studentId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    paymentsList,
    setPaymentsList,
    loading,
    error,
    loadPayments,
    fetchPayments,
    addPayment,
    updatePayment,
    deletePayment,
    getStudentPayments
  };

  return (
    <PaymentsContext.Provider value={value}>
      {children}
    </PaymentsContext.Provider>
  );
};

export default PaymentsContext;