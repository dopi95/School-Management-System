import React, { useState, useEffect } from 'react';
import { Activity, User, Calendar, Filter, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ActivityLogs = () => {
  const { language } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filter, adminFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (filter) params.append('action', filter);
      if (adminFilter) params.append('adminId', adminFilter);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/activity-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      'LOGIN': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'LOGOUT': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'PROFILE_UPDATE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'PASSWORD_CHANGE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'STUDENT_CREATE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'STUDENT_UPDATE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'STUDENT_DELETE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'STUDENT_STATUS_CHANGE': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'STUDENT_PAYMENT_UPDATE': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'EMPLOYEE_CREATE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'EMPLOYEE_UPDATE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'EMPLOYEE_DELETE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'ADMIN_CREATE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'ADMIN_UPDATE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'ADMIN_DELETE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'NOTIFICATION_SEND': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
    };
    return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Activity Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track all admin activities and system changes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Action Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="PROFILE_UPDATE">Profile Update</option>
              <option value="PASSWORD_CHANGE">Password Change</option>
              <option value="STUDENT_CREATE">Student Create</option>
              <option value="STUDENT_UPDATE">Student Update</option>
              <option value="STUDENT_DELETE">Student Delete</option>
              <option value="EMPLOYEE_CREATE">Employee Create</option>
              <option value="EMPLOYEE_UPDATE">Employee Update</option>
              <option value="ADMIN_CREATE">Admin Create</option>
              <option value="ADMIN_UPDATE">Admin Update</option>
              <option value="NOTIFICATION_SEND">Notification Send</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Activities
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading activities...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activity logs found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <div key={log._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="w-4 h-4 mr-1" />
                          <span>{log.adminName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="text-gray-900 dark:text-white mb-1">
                        {log.targetType && log.targetName && (
                          <span className="font-medium">
                            {log.targetType}: {log.targetName}
                          </span>
                        )}
                      </div>
                      
                      {log.details && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.details}
                        </p>
                      )}
                      
                      {log.ipAddress && (
                        <div className="text-xs text-gray-400 mt-2">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;