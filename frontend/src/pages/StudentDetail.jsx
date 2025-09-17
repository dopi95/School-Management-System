import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const StudentDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();

  // Mock student data - replace with API call
  const student = {
    id: id,
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    phone: '+251911234567',
    class: 'KG-1',
    dateOfBirth: '2018-05-15',
    address: 'Addis Ababa, Ethiopia',
    parentName: 'Robert Johnson',
    parentPhone: '+251911234568',
    enrollmentDate: '2023-09-01',
    status: 'Active'
  };

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
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600">
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
                    <p className="font-medium text-gray-900 dark:text-white">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('phoneNumber')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.dateOfBirth}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('class')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.class}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enrollment Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{student.enrollmentDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Information */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Parent Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Parent Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.parentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Parent Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.parentPhone}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-primary text-left">
                Edit Student
              </button>
              <button className="w-full btn-secondary text-left">
                View Attendance
              </button>
              <button className="w-full btn-secondary text-left">
                View Grades
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;