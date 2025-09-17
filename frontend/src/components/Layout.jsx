import React from 'react';
import Sidebar from './Sidebar.jsx';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8 pt-24 lg:pt-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;