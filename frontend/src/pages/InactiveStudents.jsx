import React, { useState } from 'react';
import { Search, Eye, Users, UserCheck, History, FileText, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';
import { useSpecialStudents } from '../context/SpecialStudentsContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { exportStudentsToPDF, exportStudentsToExcel } from '../utils/exportUtils.js';

const InactiveStudents = () => {
  const { t, language } = useLanguage();
  const { studentsList, loading, updateStudentStatus } = useStudents();
  const { specialStudentsList, updateSpecialStudentStatus } = useSpecialStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState({ isOpen: false, student: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

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

  const getPaymentHistory = (student) => {
    return Object.entries(student.payments)
      .filter(([_, payment]) => payment?.paid)
      .map(([key, payment]) => payment)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inactive Students</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage inactive student records</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Export Buttons */}
          <button
            onClick={() => exportStudentsToPDF(filteredStudents, 'Inactive Students List')}
            className="btn-secondary flex items-center space-x-2"
            title="Export to PDF"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportStudentsToExcel(filteredStudents, 'inactive_students_list')}
            className="btn-secondary flex items-center space-x-2"
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Count Card */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveStudents.length}</p>
            <p className="text-gray-600 dark:text-gray-400">Inactive Students</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search inactive students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
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
      {showHistoryModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment History - {showHistoryModal.student?.name}
            </h3>
            <div className="space-y-3">
              {getPaymentHistory(showHistoryModal.student).length > 0 ? (
                getPaymentHistory(showHistoryModal.student).map((payment, index) => (
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