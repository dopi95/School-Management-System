import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, UserCog, UserX, Send, Bell } from 'lucide-react';
import apiService from '../services/api.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
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

  // ===============================
  // 📊 Memoized Statistics
  // ===============================
  const stats = useMemo(() => {
    const activeEmployees = employeesList.filter(e => e.status === 'active').length;
    const inactiveEmployees = employeesList.filter(e => e.status === 'inactive').length;
    const activeStudents = studentsList.filter(s => s.status === 'active').length;
    const inactiveStudents = studentsList.filter(s => s.status === 'inactive').length;
    const totalAdmins = adminsList.length;

    const activeStudentsList = studentsList.filter(s => s.status === 'active');
    const maleStudents = activeStudentsList.filter(s => s.gender === 'male').length;
    const femaleStudents = activeStudentsList.filter(s => s.gender === 'female').length;

    const classStats = {
      'KG-1': { total: 0, male: 0, female: 0, sections: {} },
      'KG-2': { total: 0, male: 0, female: 0, sections: {} },
      'KG-3': { total: 0, male: 0, female: 0, sections: {} }
    };

    Object.keys(classStats).forEach(className => {
      classStats[className].total = activeStudentsList.filter(s => s.class === className).length;
      classStats[className].male = activeStudentsList.filter(s => s.class === className && s.gender === 'male').length;
      classStats[className].female = activeStudentsList.filter(s => s.class === className && s.gender === 'female').length;
    });

    ['A', 'B', 'C', 'D'].forEach(section => {
      Object.keys(classStats).forEach(className => {
        const sectionStudents = activeStudentsList.filter(s => s.class === className && s.section === section);
        if (sectionStudents.length > 0) {
          classStats[className].sections[section] = {
            total: sectionStudents.length,
            male: sectionStudents.filter(s => s.gender === 'male').length,
            female: sectionStudents.filter(s => s.gender === 'female').length
          };
        }
      });
    });

    return { activeEmployees, inactiveEmployees, activeStudents, inactiveStudents, totalAdmins, maleStudents, femaleStudents, classStats };
  }, [employeesList, studentsList, adminsList]);

  const { activeEmployees, inactiveEmployees, activeStudents, inactiveStudents, totalAdmins, maleStudents, femaleStudents, classStats } = stats;

  // ===============================
  // 🔐 Permissions
  // ===============================
  const hasStudentsAccess = admin?.role === 'superadmin' || admin?.permissions?.students;
  const hasInactiveStudentsAccess = admin?.role === 'superadmin' || admin?.permissions?.inactiveStudents;
  const hasEmployeesAccess = admin?.role === 'superadmin' || admin?.permissions?.employees;
  const hasAdminsAccess = admin?.role === 'superadmin' || admin?.permissions?.admins;

  // ===============================
  // 📋 Dashboard Cards
  // ===============================
  const allStats = [
    { title: 'Total Active Students', value: activeStudents, icon: Users, color: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-900', textColor: 'text-green-600 dark:text-green-400', permission: hasStudentsAccess },
    { title: 'Inactive Students', value: inactiveStudents, icon: UserX, color: 'bg-red-500', bgColor: 'bg-red-50 dark:bg-red-900', textColor: 'text-red-600 dark:text-red-400', permission: hasInactiveStudentsAccess },
    { title: 'Total Employees', value: employeesList.length, icon: GraduationCap, color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900', textColor: 'text-purple-600 dark:text-purple-400', permission: hasEmployeesAccess },
    { title: 'Inactive Employees', value: inactiveEmployees, icon: UserX, color: 'bg-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900', textColor: 'text-orange-600 dark:text-orange-400', permission: hasEmployeesAccess },
    { title: 'Total Administrators', value: totalAdmins, icon: UserCog, color: 'bg-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-900', textColor: 'text-indigo-600 dark:text-indigo-400', permission: hasAdminsAccess }
  ];

  const filteredStats = allStats.filter(stat => stat.permission);

  // ===============================
  // 📈 Charts Data
  // ===============================
  const chartData = useMemo(() => {
    const classChartData = {
      labels: Object.keys(classStats),
      datasets: [
        { label: 'Male Students', data: Object.values(classStats).map(cls => cls.male), backgroundColor: 'rgba(59, 130, 246, 0.8)', borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 1 },
        { label: 'Female Students', data: Object.values(classStats).map(cls => cls.female), backgroundColor: 'rgba(236, 72, 153, 0.8)', borderColor: 'rgba(236, 72, 153, 1)', borderWidth: 1 }
      ]
    };

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

    return { classChartData, genderChartData };
  }, [classStats, maleStudents, femaleStudents]);

  const { classChartData, genderChartData } = chartData;

  const [pendingCount, setPendingCount] = useState(0);

  // ===============================
  // 🔔 Load Pending Students & Play Sound
  // ===============================
  useEffect(() => {
    // Check for preloaded data first
    const preloaded = sessionStorage.getItem('preloadedData');
    if (preloaded) {
      try {
        const { data } = JSON.parse(preloaded);
        if (data.pendingStudents) {
          const count = data.pendingStudents.length;
          setPendingCount(count);
          
          // 🔊 Play sound only if there are pending students
          if (count > 0) {
            const audio = new Audio('/cool-s.mp3');
            audio.play().catch(() => console.log('Autoplay prevented until user interacts.'));
          }
          return;
        }
      } catch (e) {}
    }

    // Fallback to API call
    const loadPendingCount = async () => {
      try {
        const response = await apiService.request('/pending-students');
        const count = response.length;
        setPendingCount(count);

        if (count > 0) {
          const audio = new Audio('/cool-s.mp3');
          audio.play().catch(() => console.log('Autoplay prevented until user interacts.'));
        }
      } catch (error) {
        console.error('Failed to load pending students count:', error);
        setPendingCount(0);
      }
    };

    if (admin?.role === 'superadmin' || admin?.permissions?.students) {
      loadPendingCount();
    }
  }, [admin]);

  // ===============================
  // 🎨 Chart Options
  // ===============================
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' } },
      title: { display: true, color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' },
        grid: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' }
      },
      x: {
        ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' },
        grid: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' } },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}` } },
      datalabels: {
        display: true,
        color: 'white',
        font: { weight: 'bold', size: 14 },
        formatter: (value, ctx) => `${ctx.chart.data.labels[ctx.dataIndex].split(' ')[0]}\n${value}`
      }
    }
  };

  // ===============================
  // 🖼️ Render
  // ===============================
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center justify-between w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

          {(admin?.role === 'superadmin' || admin?.permissions?.students) && (
            <Link to="/pending-students" className="relative p-2 ml-3 bg-white dark:bg-gray-800 rounded-full shadow hover:shadow-md border border-gray-200 dark:border-gray-700 md:hidden">
              <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {(admin?.role === 'superadmin' || admin?.permissions?.students) && (
          <Link to="/pending-students" className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 dark:border-gray-700 hidden md:block">
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Link>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Welcome back! Here's what's happening at Bluelight Academy.
      </p>

      {/* Stats Cards */}
      {filteredStats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStats.map((stat, i) => (
            <div key={i} className="card hover:shadow-lg transition-shadow duration-200">
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
          <p className="text-gray-500 dark:text-gray-400">
            No statistics available based on your current permissions.
          </p>
        </div>
      )}

      {/* Charts Section */}
      {hasStudentsAccess && activeStudents > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Students by Class & Gender</h3>
            <div className="h-64">
              <Bar data={classChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Students Gender Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={genderChartData} options={pieOptions} />
            </div>
          </div>
        </div>
      )}
      {/* Class Details */}
      {hasStudentsAccess && activeStudents > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Students Class Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(classStats).map(([className, stats]) => (
              <div key={className} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{className}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Active Students:</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PermissionGuard permission="students">
            <Link to="/students/add" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
              <Users className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Student</p>
            </Link>
          </PermissionGuard>

          <PermissionGuard permission="employees">
            <Link to="/teachers/add" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
              <GraduationCap className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Employee</p>
            </Link>
          </PermissionGuard>

          <PermissionGuard permission="admins">
            <Link to="/admin-management" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
              <UserCog className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Manage Admins</p>
            </Link>
          </PermissionGuard>

          <PermissionGuard permission="notifications">
            <Link to="/notifications" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 block text-center">
              <Send className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Send Notification</p>
            </Link>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
