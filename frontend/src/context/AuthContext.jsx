import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Sample login credentials
    const validCredentials = {
      'admin@bluelight.edu': 'admin123',
      'superadmin@bluelight.edu': 'super123'
    };

    // Validate credentials
    if (!validCredentials[email] || validCredentials[email] !== password) {
      throw new Error('Invalid email or password');
    }

    // Mock user data based on email
    const mockUser = {
      id: 1,
      name: email === 'superadmin@bluelight.edu' ? 'Super Admin' : 'John Doe',
      email: email,
      role: 'super_admin',
      isOnline: true
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};