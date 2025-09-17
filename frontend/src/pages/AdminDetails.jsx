import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Shield, Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const AdminDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();

  // Mock admin data
  const admin = {
    id: id,
    name: 'John Doe',
    email: 'john@bluelight.edu',
    phone: '+251911234567',
    role: 'super_admin',
    status: 'Active',
    joinDate: '2023-01-15',
    address: 'Addis Ababa, Ethiopia',
    permissions: ['dashboard', 'students', 'teachers', 'admins']
  };

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
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/admins" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administrator Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View administrator information and permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Info Card */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {admin.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{admin.name}</h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                  {getRoleDisplay(admin.role)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white">{admin.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white">{admin.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Join Date</p>
                    <p className="text-gray-900 dark:text-white">{admin.joinDate}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-gray-900 dark:text-white">{admin.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Card */}
        <div>
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions</h3>
            </div>
            
            <div className="space-y-2">
              {admin.permissions.map(permission => (
                <div key={permission} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{permission}</span>
                  <span className="text-xs text-green-600 dark:text-green-400">✓ Allowed</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {admin.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetails;