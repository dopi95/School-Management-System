import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, GraduationCap, Calendar, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const TeacherDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();

  // Mock teacher data - replace with API call
  const teacher = {
    id: id,
    name: 'Dr. Sarah Connor',
    email: 'sarah.connor@bluelight.edu',
    phone: '+251911234567',
    subject: 'Mathematics',
    qualification: 'PhD in Mathematics',
    experience: '8 years',
    address: 'Addis Ababa, Ethiopia',
    joinDate: '2020-09-01',
    status: 'Active'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/teachers"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage teacher information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Profile */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-green-600">
                  {teacher.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{teacher.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{teacher.subject} Teacher</p>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mt-2">
                  {teacher.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{teacher.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('phoneNumber')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{teacher.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{teacher.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qualification</p>
                    <p className="font-medium text-gray-900 dark:text-white">{teacher.qualification}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                    <p className="font-medium text-gray-900 dark:text-white">{teacher.experience}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Join Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{teacher.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Information */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Primary Subject</p>
                <p className="font-medium text-gray-900 dark:text-white">{teacher.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Classes Teaching</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    KG-1
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    KG-2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-primary text-left">
                Edit Teacher
              </button>
              <button className="w-full btn-secondary text-left">
                View Schedule
              </button>
              <button className="w-full btn-secondary text-left">
                View Classes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;