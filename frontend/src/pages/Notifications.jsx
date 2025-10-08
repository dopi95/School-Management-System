import React, { useState, useEffect } from 'react';
import { Send, Users, MessageSquare, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Toast from '../components/Toast';

const Notifications = () => {
  const { language } = useLanguage();
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentTypeFilter, setStudentTypeFilter] = useState('all');
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const filteredStudents = students.filter(student => {
    if (studentTypeFilter === 'all') return true;
    if (studentTypeFilter === 'students') return student.type === 'Students';
    if (studentTypeFilter === 'sp-students') return student.type === 'SP Students';
    return true;
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Send Notifications
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Send notifications to students' parents
        </p>
      </div>

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
            <p className="text-xs text-gray-500 mt-1">
              Variables: {'{'}{'{'} studentName {'}'}{'}'},  {'{'}{'{'} studentClass {'}'}{'}'},  {'{'}{'{'} studentId {'}'}{'}'},  {'{'}{'{'} studentType {'}'}{'}'},  {'{'}{'{'} paymentCode {'}'}{'}'}  
            </p>
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

          {/* Student Type Filter */}
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <select
              value={studentTypeFilter}
              onChange={(e) => setStudentTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            >
              <option value="all">All Students</option>
              <option value="students">Students</option>
              <option value="sp-students">SP Students</option>
            </select>
            
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