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
        // Ensure profile picture is preserved
        const adminData = {
          ...response.admin,
          profilePicture: response.admin.profilePicture || null
        };
        setAdmin(adminData);
        setIsAuthenticated(true);
        // Cache profile data including picture
        localStorage.setItem('adminProfile', JSON.stringify(adminData));
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

  const login = async (email, password, preloadData) => {
    try {
      const response = await api.login(email, password);
      if (response.success) {
        // Clear all cached data on fresh login
        sessionStorage.removeItem('preloadedData');
        sessionStorage.removeItem('studentsCache');
        sessionStorage.removeItem('specialStudentsCache');
        sessionStorage.removeItem('employeesCache');
        sessionStorage.removeItem('adminsCache');
        
        // Ensure profile picture is preserved
        const adminData = {
          ...response.admin,
          profilePicture: response.admin.profilePicture || null
        };
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('adminProfile', JSON.stringify(adminData));
        sessionStorage.setItem('sessionActive', 'true');
        setAdmin(adminData);
        setIsAuthenticated(true);
        
        // Preload all data immediately after successful login
        if (preloadData) {
          console.log('Triggering fresh data preload after login...');
          // Don't await - let it load in background
          preloadData().then(() => {
            console.log('Data preload completed after login');
          }).catch(err => {
            console.error('Data preload failed after login:', err);
          });
        }
        
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
    // Clear all cached data on logout
    sessionStorage.removeItem('preloadedData');
    sessionStorage.removeItem('studentsCache');
    sessionStorage.removeItem('specialStudentsCache');
    sessionStorage.removeItem('employeesCache');
    sessionStorage.removeItem('adminsCache');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.updateProfile(profileData);
      if (response.success) {
        // Preserve existing profile picture if not updated
        const updatedAdmin = {
          ...response.admin,
          profilePicture: response.admin.profilePicture || admin?.profilePicture || null
        };
        setAdmin(updatedAdmin);
        // Update cached profile
        localStorage.setItem('adminProfile', JSON.stringify(updatedAdmin));
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
        // Ensure profile picture is preserved
        const adminData = {
          ...response.admin,
          profilePicture: response.admin.profilePicture || null
        };
        setAdmin(adminData);
        // Update cached profile
        localStorage.setItem('adminProfile', JSON.stringify(adminData));
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
    checkAuth,
    setLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};