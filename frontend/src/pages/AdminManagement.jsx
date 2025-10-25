import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, Eye, EyeOff, Activity, Clock, UserCog, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import SuccessModal from '../components/SuccessModal.jsx';
import DeleteModal from '../components/DeleteModal.jsx';

const AdminManagement = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, admin: null });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'active',
    permissions: {
      dashboard: true,
      students: false,
      inactiveStudents: false,
      employees: false,
      inactiveEmployees: false,
      payments: false,
      notifications: false,
      admins: false,
      profile: true,
      settings: true
    }
  });

  useEffect(() => {
    // Check cache first on mount
    const cached = sessionStorage.getItem('adminsCache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 120000) {
          setAdmins(data);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      // Check cache first
      const cached = sessionStorage.getItem('adminsCache');
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 120000) { // 2 minutes cache
            setAdmins(data);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      const response = await api.getAdmins();
      if (response.success) {
        // Cache the result
        sessionStorage.setItem('adminsCache', JSON.stringify({
          data: response.admins,
          timestamp: Date.now()
        }));
        setAdmins(response.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };



  const filteredAdmins = admins.filter(adminItem =>
    adminItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adminItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adminItem.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const response = await api.updateAdmin(editingAdmin._id, formData);
        if (response.success) {
          setSuccessModal({
            isOpen: true,
            title: 'Admin Updated!',
            message: response.message
          });
        }
      } else {
        const response = await api.createAdmin(formData);
        if (response.success) {
          setSuccessModal({
            isOpen: true,
            title: 'Admin Created!',
            message: response.message
          });
        }
      }
      fetchAdmins();
      resetForm();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (adminItem) => {
    setEditingAdmin(adminItem);
    setFormData({
      name: adminItem.name,
      email: adminItem.email,
      password: '',
      role: adminItem.role,
      status: adminItem.status,
      permissions: adminItem.permissions || {
        dashboard: true,
        students: false,
        inactiveStudents: false,
        employees: false,
        inactiveEmployees: false,
        payments: false,
        specialStudents: false,
        specialPayments: false,
        notifications: false,
        admins: false,
        profile: true,
        settings: true
      }
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await api.deleteAdmin(deleteModal.admin._id);
      if (response.success) {
        setSuccessModal({
          isOpen: true,
          title: 'Admin Deleted!',
          message: response.message
        });
        fetchAdmins();
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setDeleteModal({ isOpen: false, admin: null });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      status: 'active',
      permissions: {
        dashboard: true,
        students: false,
        inactiveStudents: false,
        employees: false,
        inactiveEmployees: false,
        payments: false,
        specialStudents: false,
        specialPayments: false,
        notifications: false,
        admins: false,
        profile: true,
        settings: true
      }
    });
    setEditingAdmin(null);
    setShowModal(false);
    setShowPassword(false);
  };

  const totalAdmins = admins.length;
  const superAdmins = admins.filter(a => a.role === 'superadmin').length;
  const regularAdmins = admins.filter(a => a.role === 'admin').length;
  const users = admins.filter(a => a.role === 'user').length;

  if (admin?.role !== 'superadmin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Access denied. Only superadmin can manage admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ 
      zoom: '0.9', 
      minWidth: '100%', 
      maxWidth: '100vw',
      position: 'relative',
      overflow: 'visible'
    }}>
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Manage system administrators</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/admin-profiles')}
            className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white font-medium text-xs lg:text-sm px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md w-fit"
          >
            <Users className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>Admin Profiles</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs lg:text-sm px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md w-fit"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>Add Admin</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:gap-6" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'visible'
      }}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalAdmins}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <UserCog className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{superAdmins}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Super Admins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{regularAdmins}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Admins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{users}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'visible'
      }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3 py-2 pl-9 lg:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
          />
        </div>
      </div>



      {/* Admins Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAdmins.map((adminItem) => (
                <tr key={adminItem._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {adminItem.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{adminItem.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{adminItem.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      adminItem.role === 'superadmin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : adminItem.role === 'admin'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {adminItem.role === 'superadmin' ? 'SuperAdministrator' : adminItem.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {adminItem.role === 'superadmin' ? (
                      <span className="text-xs text-gray-500">All Access</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(adminItem.permissions || {}).map(([key, value]) => 
                          value && key !== 'dashboard' ? (
                            <span key={key} className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {key}
                            </span>
                          ) : null
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      adminItem.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {adminItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {adminItem.lastLogin ? new Date(adminItem.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(adminItem)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit Admin"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, admin: adminItem })}
                        className="text-red-600 hover:text-red-700"
                        title="Delete Admin"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password {editingAdmin && '(leave blank to keep current)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pr-10"
                    required={!editingAdmin}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="superadmin">SuperAdministrator</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              {formData.role !== 'superadmin' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Permissions {formData.role === 'user' && '(Users can only view selected sections)'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'dashboard', label: 'Dashboard' },
                      { key: 'students', label: 'Students Management' },
                      { key: 'inactiveStudents', label: 'Inactive Students' },
                      { key: 'employees', label: 'Employees Management' },
                      { key: 'inactiveEmployees', label: 'Inactive Employees' },
                      { key: 'payments', label: 'Payments Management' },
                      { key: 'specialStudents', label: 'SP Students' },
                      { key: 'specialPayments', label: 'SP Payments' },
                      { key: 'notifications', label: 'Send Notifications' },
                      { key: 'admins', label: 'Admin Management' },
                      { key: 'settings', label: 'Settings' }
                    ].map(permission => (
                      <label key={permission.key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions?.[permission.key] || false}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              profile: true,
                              [permission.key]: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {permission.label}
                          {formData.role === 'user' && ' (View Only)'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {formData.role === 'superadmin' && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    SuperAdministrators have full access to all features and can view/modify everything including other admin profiles and passwords.
                  </p>
                </div>
              )}
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingAdmin ? 'Update' : 'Create'} Admin
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, admin: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.admin?.name}
        itemType="Admin"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        actionText="Continue"
      />
    </div>
  );
};

export default AdminManagement;