import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Users, Clock } from 'lucide-react';
import apiService from '../services/api.js';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import 'react-toastify/dist/ReactToastify.css';

const PendingStudents = () => {
  const { admin, isAuthenticated } = useAuth();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const canApproveReject = admin?.role === 'superadmin' || admin?.role === 'admin';

  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('token')) {
      loadPendingStudents();
    }
  }, [isAuthenticated]);

  const loadPendingStudents = async () => {
    if (!localStorage.getItem('token')) return;
    
    setLoading(true);
    try {
      console.log('Loading pending students...');
      const response = await apiService.request('/pending-students');
      console.log('Pending students response:', response);
      setPendingStudents(response || []);
    } catch (error) {
      console.error('Failed to load pending students:', error);
      setPendingStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId, type = 'regular') => {
    try {
      const endpoint = type === 'special' ? `/pending-students/${studentId}/approve-special` : `/pending-students/${studentId}/approve`;
      await apiService.request(endpoint, { method: 'POST' });
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      const message = type === 'special' ? 'Student approved and added to special students list!' : 'Student approved and added to students list!';
      toast.success(message, {
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
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
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
              
              {canApproveReject && (
                <div className="flex flex-col sm:flex-row gap-2 mt-6">
                  <button
                    onClick={() => {
                      handleApprove(student.id, 'regular');
                      onClose();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm flex-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve as Student</span>
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(student.id, 'special');
                      onClose();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm flex-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve as SP Student</span>
                  </button>
                  <button
                    onClick={() => {
                      handleReject(student.id);
                      onClose();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 flex-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen">
      <div className="space-y-4 lg:space-y-6 max-w-full">
        {/* Header - Fixed */}
        <div className="px-4 lg:px-0 w-full">
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">Pending Students</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">
            {canApproveReject ? 'Review and approve student registrations' : 'View pending student registrations'}
          </p>
        </div>

        {/* Count Card - Fixed */}
        <div className="px-4 lg:px-0 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:p-6 border border-gray-200 dark:border-gray-700 w-full max-w-sm">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{pendingStudents.length}</p>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 truncate">Pending Registrations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container - Only table scrolls */}
        <div className="px-4 lg:px-0 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full">
            {loading ? (
              <div className="text-center py-12 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading pending students...</p>
              </div>
            ) : pendingStudents.length > 0 ? (
              <div className="overflow-x-auto w-full">
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
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                            {canApproveReject && (
                              <>
                                <button
                                  onClick={() => handleApprove(student.id, 'regular')}
                                  className="text-green-600 hover:text-green-700"
                                  title="Approve as Student"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleApprove(student.id, 'special')}
                                  className="text-purple-600 hover:text-purple-700"
                                  title="Approve as SP Student"
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
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 w-full">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No pending student registrations</p>
              </div>
            )}
          </div>
        </div>
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