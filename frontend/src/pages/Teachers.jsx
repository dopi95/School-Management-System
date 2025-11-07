import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, Users, UserX, Edit, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useEmployees } from '../context/EmployeesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import DeleteModal from '../components/DeleteModal.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';
import ExportDropdown from '../components/ExportDropdown.jsx';
import { exportEmployeesToPDF, exportEmployeesToExcel } from '../utils/exportUtils.js';
import apiService from '../services/api.js';

const Teachers = () => {
  const { t } = useLanguage();
  const { admin } = useAuth();
  const { employeesList, loading, updateEmployeeStatus, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, employee: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [pendingCount, setPendingCount] = useState(0);

  const activeEmployees = employeesList.filter(emp => emp.status === 'active');
  
  const filteredEmployees = activeEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.position || employee.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.phone || '').includes(searchTerm)
  );

  const handleDeleteClick = (employee) => {
    setDeleteModal({ isOpen: true, employee });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEmployee(deleteModal.employee.id);
      setDeleteModal({ isOpen: false, employee: null });
      setSuccessModal({
        isOpen: true,
        title: 'Employee Deleted!',
        message: `${deleteModal.employee.name} has been successfully deleted.`
      });
    } catch (error) {
      alert('Error deleting employee: ' + error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, employee: null });
  };

  const handleStatusToggle = async (employeeId) => {
    try {
      const employee = employeesList.find(e => e.id === employeeId);
      const newStatus = employee.status === 'active' ? 'inactive' : 'active';
      await updateEmployeeStatus(employeeId, newStatus);
      setSuccessModal({
        isOpen: true,
        title: 'Status Updated!',
        message: `${employee.name} has been marked as ${newStatus}.`
      });
    } catch (error) {
      alert('Error updating employee status: ' + error.message);
    }
  };

  const activeCount = employeesList.filter(e => e.status === 'active').length;
  const inactiveCount = employeesList.filter(e => e.status === 'inactive').length;

  // Load pending students count
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const response = await apiService.request('/pending-students');
        const pendingOnly = response.filter(s => !s.status || s.status === 'pending');
        setPendingCount(pendingOnly.length);
      } catch (error) {
        console.error('Failed to load pending students count:', error);
        setPendingCount(0);
      }
    };

    if (admin?.role === 'superadmin' || admin?.permissions?.pendingStudents?.view) {
      loadPendingCount();
    }
  }, [admin]);

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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Employees</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Manage employee information and records</p>
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
        
        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-wrap gap-2">
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
          <Link to="/teachers/add" className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs lg:text-sm px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md">
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>Add Employee</span>
          </Link>
          <ExportDropdown
            onExportPDF={() => exportEmployeesToPDF(filteredEmployees, 'Active Employees List')}
            onExportExcel={() => exportEmployeesToExcel(filteredEmployees, 'active_employees_list')}
          />
        </div>
      </div>

      {/* Count Cards */}
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
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{employeesList.length}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Total Employees</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Active Employees</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <UserX className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{inactiveCount}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Inactive Employees</p>
            </div>
          </div>
        </div>
      </div>

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
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3 py-2 pl-9 lg:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Teaching Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/teachers/${employee.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {employee.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {(employee.fullName || employee.name).charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.fullName || employee.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      {employee.role || employee.position || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {((employee.position === 'Teacher' || employee.role === 'Teacher') && (employee.teachingGradeLevel || employee.classes)) ? (
                      <div className="flex flex-wrap gap-1">
                        {(employee.teachingGradeLevel || employee.classes || []).map((cls, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {cls}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/teachers/${employee.id}`}
                        className="text-primary-600 hover:text-primary-700"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/teachers/edit/${employee.id}`}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit Employee"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleStatusToggle(employee.id)}
                        className={employee.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        title={employee.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'}
                      >
                        <UserX className="w-5 h-5" />
                      </button>
                      <PermissionGuard permission="employees" action="delete">
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredEmployees.length} of {activeEmployees.length} active employees
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading employees...</p>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.employee?.name}
        itemType="Employee"
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

export default Teachers;