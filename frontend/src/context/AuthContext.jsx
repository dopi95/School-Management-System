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
  const [sessionTimeout, setSessionTimeout] = useState(null);

  useEffect(() => {
    checkAuth();
    
    // Handle browser close/refresh
    const handleBeforeUnload = () => {
      // Clear session on browser close
      sessionStorage.removeItem('sessionActive');
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Mark session as inactive when tab becomes hidden
        sessionStorage.removeItem('sessionActive');
      } else if (document.visibilityState === 'visible' && isAuthenticated) {
        // Check if session is still valid when tab becomes visible
        const sessionActive = sessionStorage.getItem('sessionActive');
        if (!sessionActive) {
          logout();
        }
      }
    };
    
    // Track user activity to refresh session
    const handleUserActivity = () => {
      if (isAuthenticated) {
        sessionStorage.setItem('sessionActive', 'true');
        setupSessionTimeout();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    document.addEventListener('touchstart', handleUserActivity);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [isAuthenticated, sessionTimeout]);
  
  const setupSessionTimeout = () => {
    // Clear existing timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    // Set 15 minute session timeout (shorter for security)
    const timeout = setTimeout(() => {
      logout();
      alert('Session expired due to inactivity. Please login again.');
    }, 15 * 60 * 1000); // 15 minutes
    
    setSessionTimeout(timeout);
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const sessionActive = sessionStorage.getItem('sessionActive');
      
      // If no token or session not active, logout
      if (!token || !sessionActive) {
        setAdmin(null);
        setIsAuthenticated(false);
        setLoading(false);
        // Clear any stored tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('sessionActive');
        return;
      }

      const response = await api.getProfile();
      if (response.success) {
        setAdmin(response.admin);
        setIsAuthenticated(true);
        // Refresh session
        sessionStorage.setItem('sessionActive', 'true');
        setupSessionTimeout();
      } else {
        // Invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('sessionActive');
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // API call failed or token invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
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
        sessionStorage.setItem('sessionActive', 'true');
        setAdmin(response.admin);
        setIsAuthenticated(true);
        setupSessionTimeout();
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('sessionActive');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
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