import React from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, UserCog, UserX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useEmployees } from '../context/EmployeesContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';
import { useAdmins } from '../context/AdminsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';

const Dashboard = () => {
  const { t } = useLanguage();
  const { admin } = useAuth();
  const { employeesList } = useEmployees();
  const { studentsList } = useStudents();
  const { adminsList } = useAdmins();
  
  const activeEmployees = employeesList.filter(e => e.status === 'active').length;
  const inactiveEmployees = employeesList.filter(e => e.status === 'inactive').length;
  const activeStudents = studentsList.filter(s => s.status === 'active').length;
  const inactiveStudents = studentsList.filter(s => s.status === 'inactive').length;
  const totalAdmins = adminsList.length;

  // Check permissions for stats display
  const hasStudentsAccess = admin?.role === 'superadmin' || admin?.permissions?.students;
  const hasInactiveStudentsAccess = admin?.role === 'superadmin' || admin?.permissions?.inactiveStudents;
  const hasEmployeesAccess = admin?.role === 'superadmin' || admin?.permissions?.employees;
  const hasAdminsAccess = admin?.role === 'superadmin' || admin?.permissions?.admins;

  const allStats = [
    {
      title: 'Total Students',
      value: studentsList.length.toString(),
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
      permission: hasStudentsAccess
    },
    {
      title: 'Active Students',
      value: activeStudents.toString(),
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400',
      permission: hasStudentsAccess
    },
    {
      title: 'Inactive Students',
      value: inactiveStudents.toString(),
      icon: UserX,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400',
      permission: hasInactiveStudentsAccess
    },
    {
      title: 'Total Employees',
      value: employeesList.length.toString(),
      icon: GraduationCap,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400',
      permission: hasEmployeesAccess
    },
    {
      title: 'Active Employees',
      value: activeEmployees.toString(),
      icon: GraduationCap,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400',
      permission: hasEmployeesAccess
    },
    {
      title: 'Total Admins',
      value: totalAdmins.toString(),
      icon: UserCog,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400',
      permission: hasAdminsAccess
    }
  ];

  // Filter stats based on permissions
  const stats = allStats.filter(stat => stat.permission);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here's what's happening at Bluelight Academy.</p>
      </div>

      {/* Stats Cards */}
      {stats.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${stats.length <= 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-6'}`}>
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
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No statistics available based on your current permissions.</p>
        </div>
      )}



      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PermissionGuard 
            permission="students" 
            fallback={
              <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-center opacity-50">
                <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No Access to Students</p>
              </div>
            }
          >
            <Link to="/students/add" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
              <Users className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Student</p>
            </Link>
          </PermissionGuard>
          
          <PermissionGuard 
            permission="employees" 
            fallback={
              <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-center opacity-50">
                <GraduationCap className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No Access to Employees</p>
              </div>
            }
          >
            <Link to="/teachers/add" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
              <GraduationCap className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Employee</p>
            </Link>
          </PermissionGuard>
          
          <PermissionGuard 
            permission="admins" 
            fallback={
              <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-center opacity-50">
                <UserCog className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No Access to Admins</p>
              </div>
            }
          >
            <Link to="/admin-management" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
              <UserCog className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Manage Admins</p>
            </Link>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;