import React from 'react';
import { Users, GraduationCap, UserCog } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const Dashboard = () => {
  const { t } = useLanguage();

  const stats = [
    {
      title: t('totalStudents'),
      value: '1,234',
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: t('totalTeachers'),
      value: '87',
      icon: GraduationCap,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: t('totalAdmins'),
      value: '12',
      icon: UserCog,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },

  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here's what's happening at Bluelight Academy.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200">
            <Users className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Student</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200">
            <GraduationCap className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Teacher</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200">
            <UserCog className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Admin</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;