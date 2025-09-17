import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User, Edit } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';

const StudentDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { studentsList } = useStudents();

  const student = studentsList.find(s => s.id === id);

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
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {student.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{student.id}</p>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mt-2">
                  {student.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Father's Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.fatherPhone || student.phone || 'Not provided'}</p>
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
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.dateOfBirth || 'Not provided'}</p>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('class')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.class || 'Not assigned'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {student.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
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
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Parent Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Father Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.fatherName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Father Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.fatherPhone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mother Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.motherName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mother Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.motherPhone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to={`/students/edit/${student.id}`} className="w-full btn-primary text-left flex items-center space-x-2">
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