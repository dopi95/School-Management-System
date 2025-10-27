import React, { useState } from 'react';
import { Search, Eye, Users, UserCheck, FileText, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useEmployees } from '../context/EmployeesContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { exportEmployeesToPDF, exportEmployeesToExcel } from '../utils/exportUtils.js';
 import { Download } from 'lucide-react'; 


const InactiveEmployees = () => {
  const { employeesList, loading, updateEmployeeStatus, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState({ isOpen: false, employee: null });

  const inactiveEmployees = employeesList.filter(employee => employee.status === 'inactive');
  const [isExportOpen, setIsExportOpen] = useState(false);

  
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
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Inactive Employees</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Manage inactive employee records</p>
        </div>
        
        {/* Export Buttons - Mobile Responsive */}
        {/* Export Dropdown */}
<div className="relative inline-block text-left">

<button
  type="button"
  onClick={() => setShowExportDropdown(prev => !prev)}
  className="inline-flex justify-center items-center w-full rounded-md border ml-4 mb-4 lg:ml-0 lg:mb-0 border-gray-300 shadow-sm px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
>
  <Download className="w-5 h-5 mr-2" /> {/* Icon added before text */}
  Export
  <svg
    className="-mr-1 ml-2 h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
      clipRule="evenodd"
    />
  </svg>
</button>

  {isExportOpen && (
    <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
      <div className="py-1">
        <button
          onClick={() => {
            exportEmployeesToPDF(filteredEmployees, 'Inactive Employees List');
            setIsExportOpen(false);
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Export as PDF</span>
        </button>
        <button
          onClick={() => {
            exportEmployeesToExcel(filteredEmployees, 'inactive_employees_list');
            setIsExportOpen(false);
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export as Excel</span>
        </button>
      </div>
    </div>
  )}
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