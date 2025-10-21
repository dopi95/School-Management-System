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
  const [admin, setAdmin] = useState(() => {
    // Load cached profile immediately
    try {
      const cached = localStorage.getItem('adminProfile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Only handle browser close to clear session
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('sessionActive');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  


  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const sessionActive = sessionStorage.getItem('sessionActive');
      
      if (!token) {
        setAdmin(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // If session not active (browser was closed), require fresh login
      if (!sessionActive) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('adminProfile'); // Clear cached profile
        setAdmin(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await api.getProfile();
      if (response.success) {
        setAdmin(response.admin);
        setIsAuthenticated(true);
        // Cache profile data including picture
        localStorage.setItem('adminProfile', JSON.stringify(response.admin));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('adminProfile');
        sessionStorage.removeItem('sessionActive');
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('adminProfile');
      sessionStorage.removeItem('sessionActive');
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
        localStorage.setItem('adminProfile', JSON.stringify(response.admin));
        sessionStorage.setItem('sessionActive', 'true');
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
    localStorage.removeItem('adminProfile');
    sessionStorage.removeItem('sessionActive');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.updateProfile(profileData);
      if (response.success) {
        setAdmin(response.admin);
        // Update cached profile
        localStorage.setItem('adminProfile', JSON.stringify(response.admin));
        return { success: true, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await api.getProfile();
      if (response.success) {
        setAdmin(response.admin);
        // Update cached profile
        localStorage.setItem('adminProfile', JSON.stringify(response.admin));
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    refreshProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};