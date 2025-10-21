import React, { useState } from 'react';
import { Search, Eye, Users, UserCheck, FileText, FileSpreadsheet } from 'lucide-react';
import { useEmployees } from '../context/EmployeesContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { exportEmployeesToPDF, exportEmployeesToExcel } from '../utils/exportUtils.js';

const InactiveEmployees = () => {
  const { employeesList, loading, updateEmployeeStatus } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const inactiveEmployees = employeesList.filter(employee => employee.status === 'inactive');
  
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
        <div className="flex flex-wrap gap-2">
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
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Classes
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
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        {employee.position || employee.role || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(employee.position === 'Teacher' || employee.role === 'Teacher') && employee.classes && employee.classes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {employee.classes.map((cls, index) => (
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