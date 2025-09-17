import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, User, Shield, Settings, Edit } from 'lucide-react';
import { useAdmins } from '../context/AdminsContext.jsx';

const AdminDetail = () => {
  const { id } = useParams();
  const { adminsList } = useAdmins();

  const admin = adminsList.find(a => a.id === id);

  if (!admin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Admin not found</p>
        <Link to="/admins" className="btn-primary mt-4">Back to Admins</Link>
      </div>
    );
  }

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'student_admin': return 'Student Admin';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'student_admin': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      dashboard: 'Dashboard',
      students: 'Students',
      'inactive-students': 'Inactive Students',
      employees: 'Employees',
      'inactive-employees': 'Inactive Employees',
      admins: 'Admins',
      payments: 'Payments',
      settings: 'Settings'
    };
    return labels[permission] || permission;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/admins"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage administrator information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Profile */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {admin.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{admin.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">@{admin.username}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                    {getRoleDisplay(admin.role)}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    admin.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {admin.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{admin.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
                    <p className="font-medium text-gray-900 dark:text-white">@{admin.username}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                    <p className="font-medium text-gray-900 dark:text-white">{getRoleDisplay(admin.role)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Permissions</p>
                    <p className="font-medium text-gray-900 dark:text-white">{admin.permissions.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions & Actions */}
        <div className="space-y-6">
          {/* Permissions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permissions</h3>
            <div className="space-y-2">
              {admin.permissions.map((permission, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {getPermissionLabel(permission)}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Granted
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link 
                to={`/admins/edit/${admin.id}`} 
                className="w-full btn-primary text-left flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetail;