import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Search, User, Shield, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const AdminProfiles = () => {
  const { admin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState({});

  useEffect(() => {
    fetchAdminProfiles();
  }, []);

  const fetchAdminProfiles = async () => {
    try {
      const response = await api.request('/auth/admins/profiles');
      if (response.success) {
        setAdmins(response.admins);
      }
    } catch (error) {
      console.error('Error fetching admin profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (adminId) => {
    setShowPasswords(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  const filteredAdmins = admins.filter(adminItem =>
    adminItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adminItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adminItem.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (admin?.role !== 'superadmin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Access denied. Only SuperAdministrator can view admin profiles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Profiles</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View all admin profiles and credentials (SuperAdministrator only)</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search admin profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Admin Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins.map((adminItem) => (
          <div key={adminItem._id} className="card">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                adminItem.role === 'superadmin' 
                  ? 'bg-purple-100 dark:bg-purple-900' 
                  : adminItem.role === 'admin'
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'bg-gray-100 dark:bg-gray-900'
              }`}>
                {adminItem.role === 'superadmin' ? (
                  <Shield className={`w-6 h-6 ${
                    adminItem.role === 'superadmin' 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                ) : (
                  <User className={`w-6 h-6 ${
                    adminItem.role === 'admin'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{adminItem.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  adminItem.role === 'superadmin' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                    : adminItem.role === 'admin'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {adminItem.role === 'superadmin' ? 'SuperAdministrator' : adminItem.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {adminItem.email}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded pr-10">
                    {showPasswords[adminItem._id] ? adminItem.password : '••••••••••••'}
                  </p>
                  <button
                    onClick={() => togglePasswordVisibility(adminItem._id)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords[adminItem._id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  adminItem.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {adminItem.status}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Last Login
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {adminItem.lastLogin ? new Date(adminItem.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Created
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(adminItem.createdAt).toLocaleDateString()}
                </p>
              </div>

              {adminItem.role !== 'superadmin' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Permissions
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(adminItem.permissions || {}).map(([key, value]) => 
                      value && key !== 'dashboard' && key !== 'profile' ? (
                        <span key={key} className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {key}
                        </span>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No admin profiles found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminProfiles;