import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User, Edit } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';
import apiService from '../services/api.js';

const StudentDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { studentsList } = useStudents();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodedId = decodeURIComponent(id);

  useEffect(() => {
    const loadStudentDetail = async () => {
      // First check if we have basic data in context
      const contextStudent = studentsList.find(s => s.id === decodedId);
      
      if (contextStudent) {
        // Show basic data immediately
        setStudent(contextStudent);
        setLoading(false);
        
        // Then fetch full details in background
        try {
          const fullStudent = await apiService.getStudent(decodedId);
          setStudent(fullStudent);
        } catch (error) {
          console.error('Error loading full student details:', error);
        }
      } else {
        // No context data, fetch from API
        try {
          const fullStudent = await apiService.getStudent(decodedId);
          setStudent(fullStudent);
        } catch (error) {
          console.error('Error loading student:', error);
          setStudent(null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadStudentDetail();
  }, [decodedId, studentsList]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Student not found</p>
        <Link to="/students" className="btn-primary mt-4">Back to Students</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/students"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage student information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Profile */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden">
                {student.photo ? (
                  <img 
                    src={student.photo.startsWith('http') ? student.photo : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${student.photo}`} 
                    alt={student.name || 'Student'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="text-3xl font-bold text-primary-600 dark:text-primary-400">${(student.firstName || student.name || 'S').charAt(0)}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {(student.firstName || student.name || 'S').charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {language === 'am' && student.firstNameAm && student.middleNameAm
                    ? `${student.firstNameAm} ${student.middleNameAm} ${student.lastNameAm || ''}`
                    : student.firstName && student.middleName && student.lastName 
                    ? `${student.firstName} ${student.middleName} ${student.lastName}`
                    : student.name
                  }
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{student.id}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {student.status}
                  </span>
                  {student.gender && (
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {student.gender === 'male' ? 'Male' : 'Female'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Personal Information */}
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full Name (English)</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.firstName && student.middleName && student.lastName 
                        ? `${student.firstName} ${student.middleName} ${student.lastName}`
                        : student.name || 'Not provided'
                      }
                    </p>
                  </div>
                </div>

                {(student.firstNameAm || student.middleNameAm || student.lastNameAm) && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Full Name (Amharic)</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {`${student.firstNameAm || ''} ${student.middleNameAm || ''} ${student.lastNameAm || ''}`.trim() || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.gender ? (student.gender === 'male' ? 'Male' : 'Female') : 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.dateOfBirth ? `${student.dateOfBirth} E.C` : 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Academic Information */}
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Student ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('class')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.class || 'Not assigned'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Section</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.section || 'Not assigned'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Joined Year</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.joinedYear || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{student.status || 'Active'}</p>
                  </div>
                </div>

                {student.paymentCode && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Code</p>
                      <p className="font-medium text-gray-900 dark:text-white">{student.paymentCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Photo & Parent Information */}
        <div className="space-y-6">
          {/* Student Photo */}
          {student.photo && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Student Photo</h3>
              <div className="w-32 h-32 border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <img 
                  src={student.photo.startsWith('http') ? student.photo : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${student.photo}`} 
                  alt={student.name || 'Student'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">No Image</div>';
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Parent Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Father Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{student.fatherName || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Father Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{student.fatherPhone || student.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mother Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{student.motherName || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mother Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{student.motherPhone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(student.originalPendingId || student.createdAt || student.updatedAt) && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>
              <div className="space-y-4">
                {student.originalPendingId && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Original Pending ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{student.originalPendingId}</p>
                    </div>
                  </div>
                )}
                {student.createdAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Registration Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(student.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {student.updatedAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(student.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to={`/students/edit/${encodeURIComponent(student.id)}`} className="w-full btn-primary text-left flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Edit Student</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;