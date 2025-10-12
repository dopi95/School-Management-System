import React from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, UserCog, UserX, User, UserCheck } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useEmployees } from '../context/EmployeesContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';
import { useAdmins } from '../context/AdminsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

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

  // Gender statistics
  const maleStudents = studentsList.filter(s => s.gender === 'male').length;
  const femaleStudents = studentsList.filter(s => s.gender === 'female').length;
  const activeMaleStudents = studentsList.filter(s => s.status === 'active' && s.gender === 'male').length;
  const activeFemaleStudents = studentsList.filter(s => s.status === 'active' && s.gender === 'female').length;

  // Class statistics
  const classStats = {
    'KG-1': {
      total: studentsList.filter(s => s.class === 'KG-1').length,
      male: studentsList.filter(s => s.class === 'KG-1' && s.gender === 'male').length,
      female: studentsList.filter(s => s.class === 'KG-1' && s.gender === 'female').length,
      sections: {}
    },
    'KG-2': {
      total: studentsList.filter(s => s.class === 'KG-2').length,
      male: studentsList.filter(s => s.class === 'KG-2' && s.gender === 'male').length,
      female: studentsList.filter(s => s.class === 'KG-2' && s.gender === 'female').length,
      sections: {}
    },
    'KG-3': {
      total: studentsList.filter(s => s.class === 'KG-3').length,
      male: studentsList.filter(s => s.class === 'KG-3' && s.gender === 'male').length,
      female: studentsList.filter(s => s.class === 'KG-3' && s.gender === 'female').length,
      sections: {}
    }
  };

  // Section statistics for each class
  ['A', 'B', 'C', 'D'].forEach(section => {
    Object.keys(classStats).forEach(className => {
      const sectionStudents = studentsList.filter(s => s.class === className && s.section === section);
      if (sectionStudents.length > 0) {
        classStats[className].sections[section] = {
          total: sectionStudents.length,
          male: sectionStudents.filter(s => s.gender === 'male').length,
          female: sectionStudents.filter(s => s.gender === 'female').length
        };
      }
    });
  });

  // Check permissions for stats display
  const hasStudentsAccess = admin?.role === 'superadmin' || admin?.permissions?.students;
  const hasInactiveStudentsAccess = admin?.role === 'superadmin' || admin?.permissions?.inactiveStudents;
  const hasEmployeesAccess = admin?.role === 'superadmin' || admin?.permissions?.employees;
  const hasInactiveEmployeesAccess = admin?.role === 'superadmin' || admin?.permissions?.inactiveEmployees;
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
      title: 'Inactive Employees',
      value: inactiveEmployees.toString(),
      icon: UserX,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900',
      textColor: 'text-orange-600 dark:text-orange-400',
      permission: hasEmployeesAccess
    },
    {
      title: 'Total Admins',
      value: totalAdmins.toString(),
      icon: UserCog,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      permission: hasAdminsAccess
    }
  ];

  // Filter stats based on permissions
  const stats = allStats.filter(stat => stat.permission);

  // Chart data for class distribution
  const classChartData = {
    labels: Object.keys(classStats),
    datasets: [
      {
        label: 'Male Students',
        data: Object.values(classStats).map(cls => cls.male),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Female Students',
        data: Object.values(classStats).map(cls => cls.female),
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 1
      }
    ]
  };

  // Gender distribution pie chart
  const genderChartData = {
    labels: ['Male Students', 'Female Students'],
    datasets: [
      {
        data: [maleStudents, femaleStudents],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(236, 72, 153, 0.8)'],
        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(236, 72, 153, 1)'],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
        }
      },
      title: {
        display: true,
        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        }
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed;
          }
        }
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return label.split(' ')[0] + '\n' + value;
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here's what's happening at Bluelight Academy.</p>
      </div>

      {/* Stats Cards */}
      {stats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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

      {/* Charts Section */}
      {hasStudentsAccess && studentsList.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Distribution Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Students by Class & Gender</h3>
            <div className="h-64">
              <Bar data={classChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {display: false}}}} />
            </div>
          </div>

          {/* Gender Distribution Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gender Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={genderChartData} options={pieOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Class Details */}
      {hasStudentsAccess && studentsList.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Class Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(classStats).map(([className, stats]) => (
              <div key={className} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{className}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Students:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 dark:text-blue-400">Male Students:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.male}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pink-600 dark:text-pink-400">Female Students:</span>
                    <span className="font-semibold text-pink-600 dark:text-pink-400">{stats.female}</span>
                  </div>
                  
                  {Object.keys(stats.sections).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sections:</h5>
                      {Object.entries(stats.sections).map(([section, sectionStats]) => (
                        <div key={section} className="text-xs space-y-1 mb-2">
                          <div className="font-medium text-gray-600 dark:text-gray-400">Section {section}:</div>
                          <div className="flex justify-between pl-2">
                            <span className="text-gray-500 dark:text-gray-500">Total:</span>
                            <span className="text-gray-700 dark:text-gray-300">{sectionStats.total}</span>
                          </div>
                          <div className="flex justify-between pl-2">
                            <span className="text-blue-500 dark:text-blue-400">Male:</span>
                            <span className="text-blue-600 dark:text-blue-400">{sectionStats.male}</span>
                          </div>
                          <div className="flex justify-between pl-2">
                            <span className="text-pink-500 dark:text-pink-400">Female:</span>
                            <span className="text-pink-600 dark:text-pink-400">{sectionStats.female}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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