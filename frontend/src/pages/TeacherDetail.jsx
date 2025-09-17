import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, GraduationCap, Calendar, User, Edit } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useEmployees } from '../context/EmployeesContext.jsx';

const TeacherDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { employeesList } = useEmployees();

  const employee = employeesList.find(e => e.id === id);

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Employee not found</p>
        <Link to="/teachers" className="btn-primary mt-4">Back to Employees</Link>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage employee information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Profile */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {employee.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{employee.role}</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${
                  employee.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {employee.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{employee.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('phoneNumber')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{employee.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{employee.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qualification</p>
                    <p className="font-medium text-gray-900 dark:text-white">{employee.qualification || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                    <p className="font-medium text-gray-900 dark:text-white">{employee.experience ? `${employee.experience} years` : 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      {employee.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo & Role Information */}
        <div className="space-y-6">
          {/* Employee Photo */}
          {employee.photo && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Photo</h3>
              <div className="w-32 h-32 border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          
          {employee.role === 'Teacher' && employee.classes && employee.classes.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Teaching Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Classes Teaching</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {employee.classes.map((cls, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to={`/teachers/edit/${employee.id}`} className="w-full btn-primary text-left flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Edit Employee</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;