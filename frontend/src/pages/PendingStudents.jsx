import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Users, Clock } from 'lucide-react';
import apiService from '../services/api.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PendingStudents = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadPendingStudents();
  }, []);

  const loadPendingStudents = async () => {
    try {
      const response = await apiService.request('/pending-students');
      setPendingStudents(response);
    } catch (error) {
      console.error('Failed to load pending students:', error);
    }
  };

  const handleApprove = async (studentId) => {
    try {
      await apiService.request(`/pending-students/${studentId}/approve`, { method: 'POST' });
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      toast.success('Student approved and added to students list!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error(`Error approving student: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleReject = async (studentId) => {
    if (window.confirm('Are you sure you want to reject this student registration? This action cannot be undone.')) {
      try {
        await apiService.request(`/pending-students/${studentId}/reject`, { method: 'DELETE' });
        setPendingStudents(prev => prev.filter(s => s.id !== studentId));
        toast.success('Student registration rejected and removed!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        toast.error(`Error rejecting student: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const StudentDetailModal = ({ student, onClose }) => {
    if (!student) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {student.photo && (
              <div className="flex justify-center mb-4">
                <img src={student.photo} alt="Student" className="w-32 h-32 object-cover rounded-lg border" />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name:</label>
                <p className="text-gray-900 dark:text-white">{`${student.firstName} ${student.middleName} ${student.lastName}`}</p>
              </div>
              
              {student.firstNameAm && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name (Amharic):</label>
                  <p className="text-gray-900 dark:text-white">{`${student.firstNameAm || ''} ${student.middleNameAm || ''} ${student.lastNameAm || ''}`.trim()}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender:</label>
                <p className="text-gray-900 dark:text-white capitalize">{student.gender}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth:</label>
                <p className="text-gray-900 dark:text-white">{student.dateOfBirth}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Class:</label>
                <p className="text-gray-900 dark:text-white">{student.class}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Joined Year:</label>
                <p className="text-gray-900 dark:text-white">{student.joinedYear}</p>
              </div>
              
              {student.email && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</label>
                  <p className="text-gray-900 dark:text-white">{student.email}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address:</label>
                <p className="text-gray-900 dark:text-white">{student.address}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Father Name:</label>
                <p className="text-gray-900 dark:text-white">{student.fatherName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Father Phone:</label>
                <p className="text-gray-900 dark:text-white">{student.fatherPhone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mother Name:</label>
                <p className="text-gray-900 dark:text-white">{student.motherName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mother Phone:</label>
                <p className="text-gray-900 dark:text-white">{student.motherPhone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted:</label>
                <p className="text-gray-900 dark:text-white">{new Date(student.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  handleApprove(student.id);
                  onClose();
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 flex-1"
              >
                <Check className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => {
                  handleReject(student.id);
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 flex-1"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pending Students</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">Review and approve student registrations</p>
      </div>

      {/* Count Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 w-full sm:max-w-sm">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{pendingStudents.length}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Pending Registrations</p>
          </div>
        </div>
      </div>

      {/* Pending Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {pendingStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{minWidth: '800px'}}>
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Father Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-orange-600">{student.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-orange-600">
                            {student.firstName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {`${student.firstName} ${student.middleName} ${student.lastName}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.fatherPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-blue-600 hover:text-blue-700"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleApprove(student.id)}
                          className="text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(student.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
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
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No pending student registrations</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal 
        student={selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />

      <ToastContainer />
    </div>
  );
};

export default PendingStudents;