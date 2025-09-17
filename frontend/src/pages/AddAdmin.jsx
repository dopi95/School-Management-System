import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const AddAdmin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    permissions: ['dashboard'] // Dashboard selected by default
  });

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  const availablePermissions = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'students', label: 'Students' },
    { value: 'inactive-students', label: 'Inactive Students' },
    { value: 'teachers', label: 'Teachers' },
    { value: 'admins', label: 'Admins' },
    { value: 'payments', label: 'Payments' },
    { value: 'settings', label: 'Settings' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Adding admin:', formData);
    navigate('/admins');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/admins" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Administrator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Create new administrator account with specific permissions</p>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Permissions
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select the sections this admin can access:</p>
              <div className="grid grid-cols-2 gap-3">
                {availablePermissions.map(permission => (
                  <label key={permission.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.value)}
                      onChange={() => handlePermissionChange(permission.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{permission.label}</span>
                  </label>
                ))}
              </div>
              {formData.permissions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selected permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.permissions.map(permission => (
                      <span key={permission} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {availablePermissions.find(p => p.value === permission)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>Create Admin</span>
            </button>
            <Link to="/admins" className="btn-secondary">
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;