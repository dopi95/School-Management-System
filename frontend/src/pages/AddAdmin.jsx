import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAdmins } from '../context/AdminsContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

const AddAdmin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const { adminsList, setAdminsList } = useAdmins();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    permissions: ['dashboard'] // Dashboard selected by default
  });
  
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  const availablePermissions = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'students', label: 'Students' },
    { value: 'inactive-students', label: 'Inactive Students' },
    { value: 'employees', label: 'Employees' },
    { value: 'inactive-employees', label: 'Inactive Employees' },
    { value: 'admins', label: 'Admins' },
    { value: 'payments', label: 'Payments' },
    { value: 'settings', label: 'Settings' }
  ];

  useEffect(() => {
    if (isEdit && id) {
      const admin = adminsList.find(a => a.id === id);
      if (admin) {
        setFormData({
          name: admin.name || '',
          email: admin.email || '',
          username: admin.username || '',
          role: admin.role || '',
          permissions: admin.permissions || ['dashboard']
        });
      }
    }
  }, [isEdit, id, adminsList]);

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

  const generateId = () => {
    const existingIds = adminsList.map(a => parseInt(a.id.replace('A', '')));
    const maxId = Math.max(...existingIds, 0);
    return `A${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEdit) {
      setAdminsList(prev => prev.map(admin => 
        admin.id === id ? { ...admin, ...formData } : admin
      ));
      setSuccessModal({
        isOpen: true,
        title: 'Admin Updated!',
        message: `${formData.name || 'Admin'} has been successfully updated.`
      });
    } else {
      const newAdmin = {
        id: generateId(),
        ...formData
      };
      setAdminsList(prev => [...prev, newAdmin]);
      setSuccessModal({
        isOpen: true,
        title: 'Admin Added!',
        message: `${formData.name || 'New admin'} has been successfully added to the system.`
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
    navigate('/admins');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/admins" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Administrator' : 'Add Administrator'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEdit ? 'Update administrator account and permissions' : 'Create new administrator account with specific permissions'}
          </p>
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
              <span>{isEdit ? 'Update Admin' : 'Create Admin'}</span>
            </button>
            <Link to="/admins" className="btn-secondary">
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleSuccessClose}
        title={successModal.title}
        message={successModal.message}
        actionText="View Admins"
      />
    </div>
  );
};

export default AddAdmin;