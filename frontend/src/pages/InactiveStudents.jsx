import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Users, UserCheck, History, Trash2, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';
import { useSpecialStudents } from '../context/SpecialStudentsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';
import ExportDropdown from '../components/ExportDropdown.jsx';
import { exportStudentsToPDF, exportStudentsToExcel } from '../utils/exportUtils.js';
import apiService from '../services/api.js';

const InactiveStudents = () => {
  const { t, language } = useLanguage();
  const { admin } = useAuth();
  const { studentsList, loading, updateStudentStatus, deleteStudent } = useStudents();
  const { specialStudentsList, updateSpecialStudentStatus, deleteSpecialStudent } = useSpecialStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState({ isOpen: false, student: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState({ isOpen: false, student: null });
  const [pendingCount, setPendingCount] = useState(0);

  const inactiveRegularStudents = studentsList.filter(student => student.status === 'inactive');
  const inactiveSpecialStudents = specialStudentsList.filter(student => student.status === 'inactive');
  const inactiveStudents = [...inactiveRegularStudents, ...inactiveSpecialStudents];
  
  const filteredStudents = inactiveStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  const handleStatusToggle = async (studentId) => {
    try {
      const regularStudent = studentsList.find(s => s.id === studentId);
      const specialStudent = specialStudentsList.find(s => s.id === studentId);
      const student = regularStudent || specialStudent;
      
      if (regularStudent) {
        await updateStudentStatus(studentId, 'active');
      } else if (specialStudent) {
        await updateSpecialStudentStatus(studentId, 'active');
      }
      
      setSuccessModal({
        isOpen: true,
        title: 'Student Activated!',
        message: `${student.name} has been successfully activated.`
      });
    } catch (error) {
      alert('Error updating student status: ' + error.message);
    }
  };

  const handleDeleteStudent = async () => {
    try {
      const { student } = showDeleteModal;
      const regularStudent = studentsList.find(s => s.id === student.id);
      
      if (regularStudent) {
        await deleteStudent(student.id);
      } else {
        await deleteSpecialStudent(student.id);
      }
      
      setShowDeleteModal({ isOpen: false, student: null });
      setSuccessModal({
        isOpen: true,
        title: 'Student Deleted!',
        message: `${student.name} has been permanently deleted.`
      });
    } catch (error) {
      alert('Error deleting student: ' + error.message);
    }
  };

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

  const getPaymentHistory = (student) => {
    return Object.entries(student.payments)
      .filter(([_, payment]) => payment?.paid)
      .map(([key, payment]) => payment)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Inactive Students</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Manage inactive student records</p>
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
          <div className="ml-5 lg:ml-0">
            <ExportDropdown
              onExportPDF={() => exportStudentsToPDF(filteredStudents, 'Inactive Students List', language, 'inactive_students_list')}
              onExportExcel={() => exportStudentsToExcel(filteredStudents, 'inactive_students_list', language)}
            />
          </div>
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
            <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{inactiveStudents.length}</p>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Inactive Students</p>
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
            placeholder="Search inactive students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3 py-2 pl-9 lg:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
          />
        </div>
      </div>

      {/* Students Table */}
      {inactiveStudents.length > 0 && (
        <div className="card overflow-hidden">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          student.id.startsWith('SP') 
                            ? 'bg-purple-100 dark:bg-purple-900' 
                            : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          <span className={`text-sm font-medium ${
                            student.id.startsWith('SP') 
                              ? 'text-purple-600 dark:text-purple-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {language === 'am' && student.firstNameAm && student.middleNameAm
                              ? `${student.firstNameAm} ${student.middleNameAm}`
                              : student.firstName && student.middleName 
                              ? `${student.firstName} ${student.middleName}`
                              : student.name
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 dark:text-white">{student.id}</span>
                        {student.id.startsWith('SP') && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            Special
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        {student.section || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleStatusToggle(student.id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400"
                          title="Activate Student"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowHistoryModal({ isOpen: true, student })}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          title="Payment History"
                        >
                          <History className="w-5 h-5" />
                        </button>
                        <PermissionGuard 
                          permission={student.id.startsWith('SP') ? 'specialStudents' : 'inactiveStudents'} 
                          action="delete"
                        >
                          <button
                            onClick={() => setShowDeleteModal({ isOpen: true, student })}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                            title="Delete Student"
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
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No inactive students found</p>
          </div>
        )}
        </div>
      )}

      {/* Results Count */}
      {filteredStudents.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredStudents.length} of {inactiveStudents.length} inactive students
        </div>
      )}

      {/* Payment History Modal */}
      {showHistoryModal.isOpen && (() => {
        const paymentHistory = getPaymentHistory(showHistoryModal.student);
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment History - {showHistoryModal.student?.name}
              </h3>
              <div className="space-y-3">
                {paymentHistory.length > 0 ? (
                  paymentHistory.map((payment, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {payment.month} {payment.year}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Date: {payment.date}
                          </p>
                          {payment.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Description: {payment.description}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Paid
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No payment history found
                  </p>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setShowHistoryModal({ isOpen: false, student: null })}
                  className="btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Student
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to permanently delete <strong>{showDeleteModal.student?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal({ isOpen: false, student: null })}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
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

export default InactiveStudents;