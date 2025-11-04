import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, Eye, EyeOff, Activity, Clock, UserCog, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import apiService from '../services/api.js';
import SuccessModal from '../components/SuccessModal.jsx';
import DeleteModal from '../components/DeleteModal.jsx';
import { canView, canCreate, canEdit, canDelete } from '../utils/permissions.js';

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
  const [pendingCount, setPendingCount] = useState(0);
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
      pendingStudents: false,
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

  // Load pending students count
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const response = await apiService.request('/pending-students');
        setPendingCount(response.length);
      } catch (error) {
        console.error('Failed to load pending students count:', error);
        setPendingCount(0);
      }
    };

    if (admin?.role === 'superadmin' || admin?.permissions?.pendingStudents?.view) {
      loadPendingCount();
    }
  }, [admin]);

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
      console.log('Submitting admin with permissions:', formData.permissions);
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
    
    // Merge existing permissions with default structure to ensure all fields exist
    const defaultPermissions = {
      dashboard: true,
      students: false,
      inactiveStudents: false,
      pendingStudents: false,
      employees: false,
      inactiveEmployees: false,
      payments: false,
      specialStudents: false,
      specialPayments: false,
      notifications: false,
      admins: false,
      profile: true,
      settings: true
    };
    
    // Handle both old boolean permissions and new object permissions
    const mergedPermissions = {};
    Object.keys(defaultPermissions).forEach(key => {
      if (adminItem.permissions && adminItem.permissions[key] !== undefined) {
        // If it's an object (new format), keep it as is
        if (typeof adminItem.permissions[key] === 'object') {
          mergedPermissions[key] = adminItem.permissions[key];
        } else {
          // If it's a boolean (old format), keep as boolean for simple permissions
          // or convert to object for complex permissions
          const complexPermissions = ['students', 'inactiveStudents', 'pendingStudents', 'employees', 'inactiveEmployees', 'payments', 'otherPayments', 'specialStudents', 'specialPayments', 'admins'];
          if (complexPermissions.includes(key) && adminItem.permissions[key] === true) {
            // Convert boolean true to full permissions object
            mergedPermissions[key] = {
              view: true,
              create: true,
              edit: true,
              delete: true
            };
          } else {
            mergedPermissions[key] = adminItem.permissions[key];
          }
        }
      } else {
        mergedPermissions[key] = defaultPermissions[key];
      }
    });
    
    setFormData({
      name: adminItem.name,
      email: adminItem.email,
      password: '',
      role: adminItem.role,
      status: adminItem.status,
      permissions: mergedPermissions
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
        pendingStudents: false,
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
  const teachers = admins.filter(a => a.role === 'teacher').length;

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
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Manage system administrators</p>
          </div>
          
          {(admin?.role === 'superadmin' || admin?.permissions?.pendingStudents?.view) && (
            <Link to="/pending-students" className="relative p-2 ml-3 bg-white dark:bg-gray-800 rounded-full shadow hover:shadow-md border border-gray-200 dark:border-gray-700 lg:hidden">
              <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Bell Icon for Desktop */}
          {(admin?.role === 'superadmin' || admin?.permissions?.pendingStudents?.view) && (
            <Link to="/pending-students" className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 dark:border-gray-700 hidden lg:block">
              <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => navigate('/admin-profiles')}
            className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white font-medium text-xs lg:text-sm px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md w-fit"
          >
            <Users className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>Admin Profiles</span>
          </button>
          {canCreate(admin, 'admins') && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs lg:text-sm px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md w-fit"
            >
              <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>Add Admin</span>
            </button>
          )}
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
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Executives</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{teachers}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Teachers</p>
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
                {(canEdit(admin, 'admins') || canDelete(admin, 'admins')) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
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
                      {adminItem.role === 'superadmin' ? 'SuperAdministrator' : adminItem.role === 'admin' ? 'Admin' : 'Executive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {adminItem.role === 'superadmin' ? (
                      <span className="text-xs text-gray-500">All Access</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(adminItem.permissions || {}).map(([key, value]) => {
                          // Handle both boolean and object permissions
                          const hasPermission = typeof value === 'object' ? value.view : value;
                          return hasPermission && key !== 'dashboard' && key !== 'profile' ? (
                            <span key={key} className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {key === 'otherPayments' ? 'Other Payments' : 
                               key === 'specialStudents' ? 'SP Students' : 
                               key === 'specialPayments' ? 'SP Payments' : 
                               key === 'inactiveStudents' ? 'Inactive Students' : 
                               key === 'inactiveEmployees' ? 'Inactive Employees' : 
                               key}
                            </span>
                          ) : null;
                        })}
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
                  {(canEdit(admin, 'admins') || canDelete(admin, 'admins')) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {canEdit(admin, 'admins') && (
                          <button
                            onClick={() => handleEdit(adminItem)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit Admin"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {canDelete(admin, 'admins') && (
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, admin: adminItem })}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Admin"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
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
                  <option value="user">Executive</option>
                  <option value="teacher">Teacher</option>
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
              
              {formData.role === 'teacher' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Assigned Classes & Sections
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['KG-1', 'KG-2', 'KG-3'].map(cls => (
                      <div key={cls} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{cls}</h4>
                        <div className="space-y-1">
                          {['A', 'B', 'C', 'D', 'N/A'].map(section => (
                            <label key={section} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.assignedClasses?.some(ac => ac.class === cls && ac.section === section) || false}
                                onChange={(e) => {
                                  const current = formData.assignedClasses || [];
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      assignedClasses: [...current, { class: cls, section }]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      assignedClasses: current.filter(ac => !(ac.class === cls && ac.section === section))
                                    });
                                  }
                                }}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {section === 'N/A' ? 'No Section' : `Section ${section}`}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {formData.role !== 'superadmin' && formData.role !== 'teacher' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Permissions
                  </label>
                  <div className="space-y-4">
                    {/* Simple permissions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'dashboard', label: 'Dashboard' },
                        { key: 'notifications', label: 'Send Notifications' },
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
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    {/* Action-based permissions */}
                    {[
                      { key: 'students', label: 'Students Management' },
                      { key: 'inactiveStudents', label: 'Inactive Students' },
                      { key: 'pendingStudents', label: 'Pending Students', actions: ['view', 'approve'] },
                      { key: 'employees', label: 'Employees Management' },
                      { key: 'inactiveEmployees', label: 'Inactive Employees' },
                      { key: 'payments', label: 'Monthly Payments' },

                      { key: 'specialStudents', label: 'SP Students' },
                      { key: 'specialPayments', label: 'SP Payments' },
                      { key: 'admins', label: 'Admin Management', actions: ['view', 'create', 'edit', 'delete'] }
                    ].map(module => {
                      // For admin role, only show view permission (page access)
                      const actionsToShow = formData.role === 'admin' 
                        ? ['view'] 
                        : (module.actions || ['view', 'create', 'edit', 'delete']);
                      
                      return (
                        <div key={module.key} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{module.label}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {actionsToShow.map(action => (
                              <label key={action} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={(() => {
                                    const permission = formData.permissions?.[module.key];
                                    if (typeof permission === 'object') {
                                      return permission?.[action] || false;
                                    }
                                    // For boolean permissions, only check 'view' action
                                    return action === 'view' ? (permission || false) : false;
                                  })()}
                                  onChange={(e) => {
                                    if (formData.role === 'admin' && action === 'view') {
                                      // For admin role, when checking view, also enable all actions
                                      const allActions = module.actions || ['view', 'create', 'edit', 'delete'];
                                      const actionPermissions = {};
                                      allActions.forEach(act => {
                                        actionPermissions[act] = e.target.checked;
                                      });
                                      
                                      setFormData({
                                        ...formData,
                                        permissions: {
                                          ...formData.permissions,
                                          profile: true,
                                          [module.key]: actionPermissions
                                        }
                                      });
                                    } else {
                                      // For user role or individual action changes
                                      const currentPermissions = formData.permissions?.[module.key] || {};
                                      const updatedPermissions = {
                                        ...currentPermissions,
                                        [action]: e.target.checked
                                      };
                                      
                                      setFormData({
                                        ...formData,
                                        permissions: {
                                          ...formData.permissions,
                                          profile: true,
                                          [module.key]: updatedPermissions
                                        }
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                  {formData.role === 'admin' && action === 'view' ? 'Page Access' : action}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
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
              {formData.role === 'admin' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Admins get full access (view, create, edit, delete) to selected pages. Simply check "Page Access" to enable complete functionality for that module.
                  </p>
                </div>
              )}
              {formData.role === 'user' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Executives have limited access. Configure which modules they can access and what actions they can perform.
                  </p>
                </div>
              )}
              {formData.role === 'teacher' && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Teachers can only view students in their assigned classes. They have access to Dashboard, My Students, Profile, and Settings only.
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