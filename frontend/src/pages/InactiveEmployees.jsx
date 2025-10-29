import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Users, UserCheck, FileText, FileSpreadsheet, Trash2, Bell } from 'lucide-react';
import { useEmployees } from '../context/EmployeesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { exportEmployeesToPDF, exportEmployeesToExcel } from '../utils/exportUtils.js';
import apiService from '../services/api.js';

const InactiveEmployees = () => {
  const { admin } = useAuth();
  const { employeesList, loading, updateEmployeeStatus, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState({ isOpen: false, employee: null });
  const [pendingCount, setPendingCount] = useState(0);

  const inactiveEmployees = employeesList.filter(employee => employee.status === 'inactive');
  
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

  const filteredEmployees = inactiveEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.position || employee.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.phone || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6" style={{ 
      zoom: '0.9', 
      minWidth: '100%', 
      maxWidth: '100vw',
      position: 'relative',
      overflow: 'visible'
    }}>
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Inactive Employees</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Manage inactive employee records</p>
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
        
        {/* Export Buttons - Mobile Responsive */}
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
          <button
            onClick={() => exportEmployeesToPDF(filteredEmployees, 'Inactive Employees List')}
            className="btn-secondary flex items-center space-x-1 text-xs lg:text-sm px-2 py-1 lg:px-4 lg:py-2"
            title="Export to PDF"
          >
            <FileText className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportEmployeesToExcel(filteredEmployees, 'inactive_employees_list')}
            className="btn-secondary flex items-center space-x-1 text-xs lg:text-sm px-2 py-1 lg:px-4 lg:py-2"
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Count Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'visible'
      }}>
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{inactiveEmployees.length}</p>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Inactive Employees</p>
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
            placeholder="Search inactive employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3 py-2 pl-9 lg:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="card overflow-hidden">
        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        {employee.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
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
                        <button
                          onClick={async () => {
                            try {
                              await updateEmployeeStatus(employee.id, 'active');
                              setSuccessModal({
                                isOpen: true,
                                title: 'Employee Activated!',
                                message: `${employee.name} has been successfully activated.`
                              });
                            } catch (error) {
                              alert('Error updating employee status: ' + error.message);
                            }
                          }}
                          className="text-green-600 hover:text-green-700 dark:text-green-400"
                          title="Activate Employee"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal({ isOpen: true, employee })}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          title="Delete Employee"
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
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No inactive employees found</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredEmployees.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredEmployees.length} of {inactiveEmployees.length} inactive employees
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Employee
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to permanently delete <strong>{showDeleteModal.employee?.fullName || showDeleteModal.employee?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal({ isOpen: false, employee: null })}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteEmployee(showDeleteModal.employee.id);
                    setShowDeleteModal({ isOpen: false, employee: null });
                    setSuccessModal({
                      isOpen: true,
                      title: 'Employee Deleted!',
                      message: `${showDeleteModal.employee.fullName || showDeleteModal.employee.name} has been permanently deleted.`
                    });
                  } catch (error) {
                    alert('Error deleting employee: ' + error.message);
                  }
                }}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default InactiveEmployees;