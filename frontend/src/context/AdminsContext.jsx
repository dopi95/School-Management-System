import React, { createContext, useContext, useState } from 'react';

const AdminsContext = createContext();

export const useAdmins = () => {
  const context = useContext(AdminsContext);
  if (!context) {
    throw new Error('useAdmins must be used within an AdminsProvider');
  }
  return context;
};

export const AdminsProvider = ({ children }) => {
  const [adminsList, setAdminsList] = useState([
    { id: 'A001', name: 'John Smith', email: 'john@school.com', username: 'johnsmith', role: 'super_admin', permissions: ['dashboard', 'students', 'employees', 'admins', 'payments', 'settings'], status: 'active' },
    { id: 'A002', name: 'Sarah Johnson', email: 'sarah@school.com', username: 'sarahj', role: 'admin', permissions: ['dashboard', 'students', 'payments'], status: 'active' },
    { id: 'A003', name: 'Mike Wilson', email: 'mike@school.com', username: 'mikew', role: 'admin', permissions: ['dashboard', 'employees', 'settings'], status: 'active' }
  ]);

  const deleteAdmin = (adminId) => {
    setAdminsList(prev => prev.filter(admin => admin.id !== adminId));
  };

  const value = {
    adminsList,
    setAdminsList,
    deleteAdmin
  };

  return (
    <AdminsContext.Provider value={value}>
      {children}
    </AdminsContext.Provider>
  );
};

export default AdminsContext;