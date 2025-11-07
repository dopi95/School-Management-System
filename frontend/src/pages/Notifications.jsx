import React, { useState, useEffect } from 'react';
import { Send, Users, MessageSquare, CheckSquare, Square, ChevronDown, Search, History, Calendar, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import apiService from '../services/api';

const Notifications = () => {
  const { language } = useLanguage();
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState('send');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentTypeFilter, setStudentTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchStudents();
    if (activeTab === 'history') {
      fetchSentNotifications();
    }
  }, [activeTab]);

  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const response = await apiService.request('/pending-students');
        const pendingOnly = response.filter(s => !s.status || s.status === 'pending');
        setPendingCount(pendingOnly.length);
      } catch (error) {
        console.error('Failed to load pending students count:', error);
        setPendingCount(0);
      }
    };

    if (admin?.role === 'superadmin' || admin?.permissions?.pendingStudents?.view) {
      loadPendingCount();
    }
  }, [admin]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchSentNotifications = async () => {
    setLoadingHistory(true);
    try {
      // Mock data for now - replace with actual API call when backend is ready
      const mockNotifications = [
        {
          id: 1,
          title: 'Monthly Payment Reminder',
          message: 'Dear parent, this is a reminder that {{studentName}} monthly payment is due.',
          sentDate: '2024-01-15T10:30:00Z',
          recipientCount: 25,
          sentBy: 'Admin User'
        },
        {
          id: 2,
          title: 'Parent Meeting Notice',
          message: 'There will be a parent meeting on Friday at 2 PM. Please attend.',
          sentDate: '2024-01-10T14:15:00Z',
          recipientCount: 45,
          sentBy: 'Admin User'
        },
        {
          id: 3,
          title: 'Holiday Announcement',
          message: 'School will be closed tomorrow due to national holiday.',
          sentDate: '2024-01-08T09:00:00Z',
          recipientCount: 120,
          sentBy: 'Admin User'
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setSentNotifications(mockNotifications);
        setLoadingHistory(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
      setSentNotifications([]);
      setLoadingHistory(false);
    }
  };

  const filteredStudents = students.filter(student => {
    // Filter by type
    let matchesType = true;
    if (studentTypeFilter === 'students') matchesType = student.type === 'Students';
    else if (studentTypeFilter === 'sp-students') matchesType = student.type === 'SP Students';
    
    // Filter by search query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const studentName = (student.name || '').toLowerCase();
      const amharicName = `${student.firstNameAm || ''} ${student.middleNameAm || ''}`.toLowerCase();
      matchesSearch = studentName.includes(query) || amharicName.includes(query) || student.id.toLowerCase().includes(query);
    }
    
    return matchesType && matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim() || selectedStudents.length === 0) {
      setToast({ show: true, message: 'Please fill in all fields and select at least one student', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const recipients = [];
      selectedStudents.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const phones = [];
          if (student.fatherPhone) phones.push(student.fatherPhone);
          if (student.motherPhone) phones.push(student.motherPhone);
          if (student.parentPhone && phones.length === 0) phones.push(student.parentPhone);
          
          phones.forEach(phone => {
            recipients.push({
              studentId: studentId,
              studentName: student.name || 'Unknown',
              parentPhone: phone
            });
          });
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          message,
          recipients
        })
      });

      if (response.ok) {
        setToast({ 
          show: true, 
          message: `Notification sent successfully to ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}!`, 
          type: 'success' 
        });
        setTitle('');
        setMessage('');
        setSelectedStudents([]);
      } else {
        setToast({ show: true, message: 'Failed to send notification. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setToast({ show: true, message: 'Error sending notification. Please check your connection.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Send notifications to students' parents and view history
            </p>
          </div>
          {(admin?.role === 'superadmin' || admin?.permissions?.pendingStudents?.view) && (
            <Link to="/pending-students" className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
              <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('send')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <History className="w-4 h-4 mr-2" />
                Sent Notifications
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Message Composition */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Compose Message
            </h2>
          </div>

          {/* Variable Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Insert Variable
            </label>
            <div className="relative">
              <button
                onClick={() => setShowVariableDropdown(!showVariableDropdown)}
                className="w-full px-4 py-2 text-left bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <span className="text-gray-900 dark:text-white">
                  Choose a variable...
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showVariableDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  {[
                    { id: 'studentName', name: 'Student Name', variable: '{{studentName}}' },
                    { id: 'studentClass', name: 'Student Class', variable: '{{studentClass}}' },
                    { id: 'studentId', name: 'Student ID', variable: '{{studentId}}' },
                    { id: 'studentType', name: 'Student Type', variable: '{{studentType}}' },
                    { id: 'paymentCode', name: 'Payment Code', variable: '{{paymentCode}}' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMessage(prev => prev + item.variable);
                        setShowVariableDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    >
                      {item.name} - {item.variable}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Message title..."
            />
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Write your message here..."
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendNotification}
            disabled={loading || selectedStudents.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5 mr-2" />
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>

        {/* Student Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Students
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {selectedStudents.length} / {filteredStudents.length} selected
            </span>
          </div>

          {/* Filters */}
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Type
                </label>
                <select
                  value={studentTypeFilter}
                  onChange={(e) => setStudentTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Students</option>
                  <option value="students">Students</option>
                  <option value="sp-students">SP Students</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Students
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedStudents.length === filteredStudents.length ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span>
                {selectedStudents.length === filteredStudents.length 
                  ? 'Unselect All'
                  : 'Select All'
                }
              </span>
            </button>
          </div>

          {/* Student List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                onClick={() => handleStudentSelect(student.id)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                {selectedStudents.includes(student.id) ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {language === 'am' && student.firstNameAm && student.middleNameAm
                      ? `${student.firstNameAm} ${student.middleNameAm}`
                      : student.name || 'Unknown Student'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    Class: {student.class || 'N/A'} {student.type && `(${student.type})`}
                  </p>
                  <div className="text-xs text-gray-400">
                    {student.fatherPhone && (
                      <div>{student.fatherPhone}</div>
                    )}
                    {student.motherPhone && (
                      <div>{student.motherPhone}</div>
                    )}
                    {!student.fatherPhone && !student.motherPhone && student.parentPhone && (
                      <div>{student.parentPhone}</div>
                    )}
                    {!student.fatherPhone && !student.motherPhone && !student.parentPhone && (
                      <div>No phone</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found
            </div>
          )}
        </div>
        </div>
      )}

      {/* Sent Notifications History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <History className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sent Notifications History
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View all previously sent notifications
            </p>
          </div>

          <div className="p-6">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading notifications...</span>
              </div>
            ) : sentNotifications.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No notifications sent yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(notification.sentDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {notification.recipientCount} recipients
                          </div>
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {notification.sentBy}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={5000}
      />
    </div>
  );
};

export default Notifications;