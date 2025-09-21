import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAdmin(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await api.getProfile();
      if (response.success) {
        setAdmin(response.admin);
        setIsAuthenticated(true);
      } else {
        // Invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // API call failed or token invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        setAdmin(response.admin);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.updateProfile(profileData);
      if (response.success) {
        setAdmin(response.admin);
        return { success: true, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};