import React from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, UserCog, UserX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const Dashboard = () => {
  const { t } = useLanguage();

  const stats = [
    {
      title: t('totalStudents'),
      value: '6',
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Active Students',
      value: '6',
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Inactive Students',
      value: '0',
      icon: UserX,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: t('totalTeachers'),
      value: '5',
      icon: GraduationCap,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: t('totalAdmins'),
      value: '3',
      icon: UserCog,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here's what's happening at Bluelight Academy.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>



      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/students/add" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
            <Users className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Student</p>
          </Link>
          <Link to="/teachers/add" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
            <GraduationCap className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Teacher</p>
          </Link>
          <Link to="/admins/add" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
            <UserCog className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Admin</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;