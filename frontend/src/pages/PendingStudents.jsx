import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, X, Users, Clock, Download, Trash2, Search } from 'lucide-react';
import apiService from '../services/api.js';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import { canView, canCreate, canEdit, canDelete, canApprove } from '../utils/permissions.js';
import eventBus from '../utils/eventBus.js';
import jsPDF from 'jspdf';
import 'react-toastify/dist/ReactToastify.css';

const PendingStudentRow = React.memo(({ student, canApproveReject, canDeletePending, onApprove, onReject, onDelete }) => {
  const getStatusBadge = () => {
    if (student.status === 'approved') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Approved as {student.approvedAs === 'special' ? 'SP Student' : 'Student'}
        </span>
      );
    }
    if (student.status === 'rejected') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
        Pending
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-orange-600">{student.id}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-orange-600">
              {student.firstName.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {`${student.firstName} ${student.middleName} ${student.lastName}`}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {student.class}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          (student.studentType || 'new') === 'new' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {(student.studentType || 'new') === 'new' ? 'New (አዲስ)' : 'Existing (ነባር)'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {student.fatherPhone}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {new Date(student.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          {(canApproveReject || canDeletePending) && (
            <>
              {canApproveReject && (!student.status || student.status === 'pending' || student.status === 'rejected') && (
                <>
                  <button
                    onClick={() => onApprove(student.id, 'regular')}
                    className="text-green-600 hover:text-green-700 p-1"
                    title="Approve as Student"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onApprove(student.id, 'special')}
                    className="text-purple-600 hover:text-purple-700 p-1"
                    title="Approve as SP Student"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </>
              )}
              {canApproveReject && (!student.status || student.status === 'pending' || student.status === 'approved') && (
                <button
                  onClick={() => onReject(student.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {canDeletePending && (
                <button
                  onClick={() => onDelete(student.id)}
                  className="text-gray-600 hover:text-gray-700 p-1"
                  title="Delete Permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

const PendingStudents = () => {
  const { admin, isAuthenticated } = useAuth();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  
  const canApproveReject = canApprove(admin, 'pendingStudents');
  const canDeletePending = canDelete(admin, 'pendingStudents');

  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('token')) {
      loadPendingStudents();
    }
  }, [isAuthenticated]);

  // Auto-refresh every 2 minutes (same as special students)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!document.hidden && localStorage.getItem('token')) {
        loadPendingStudents(false);
      }
    }, 120000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const loadPendingStudents = async (showLoading = true) => {
    if (!localStorage.getItem('token')) return;
    
    if (showLoading) setLoading(true);
    try {
      const response = await apiService.getPendingStudents();
      // Sort: pending first, then approved/rejected
      const sorted = (response || []).sort((a, b) => {
        const aStatus = a.status || 'pending';
        const bStatus = b.status || 'pending';
        if (aStatus === 'pending' && bStatus !== 'pending') return -1;
        if (aStatus !== 'pending' && bStatus === 'pending') return 1;
        return 0;
      });
      setPendingStudents(sorted);
    } catch (error) {
      console.error('Failed to load pending students:', error);
      setPendingStudents([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleApprove = useCallback(async (studentId, type = 'regular') => {
    try {
      const endpoint = type === 'special' ? `/pending-students/${studentId}/approve-special` : `/pending-students/${studentId}/approve`;
      await apiService.request(endpoint, { method: 'POST' });
      
      // Update status and move to bottom
      setPendingStudents(prev => {
        const updated = prev.map(s => 
          s.id === studentId 
            ? { ...s, status: 'approved', approvedAs: type, approvedAt: new Date().toISOString() }
            : s
        );
        // Sort: pending first, then approved/rejected
        return updated.sort((a, b) => {
          const aStatus = a.status || 'pending';
          const bStatus = b.status || 'pending';
          if (aStatus === 'pending' && bStatus !== 'pending') return -1;
          if (aStatus !== 'pending' && bStatus === 'pending') return 1;
          return 0;
        });
      });
      
      // Emit events to refresh other contexts
      if (type === 'special') {
        eventBus.emit('specialStudentAdded', { studentId, type: 'approved' });
      } else {
        eventBus.emit('studentAdded', { studentId, type: 'approved' });
      }
      
      apiService.invalidateCache('students');
      apiService.invalidateCache('special-students');
      const message = type === 'special' ? 'Student approved and added to special students list!' : 'Student approved and added to students list!';
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error(`Error approving student: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, []);

  const handleReject = useCallback(async (studentId) => {
    try {
      // Call backend to update status to rejected (backend handles removal from main lists)
      await apiService.request(`/pending-students/${studentId}/reject`, { method: 'POST' });
      
      // Update local state
      setPendingStudents(prev => {
        const updated = prev.map(s => 
          s.id === studentId 
            ? { ...s, status: 'rejected', rejectedAt: new Date().toISOString() }
            : s
        );
        // Sort: pending first, then approved/rejected
        return updated.sort((a, b) => {
          const aStatus = a.status || 'pending';
          const bStatus = b.status || 'pending';
          if (aStatus === 'pending' && bStatus !== 'pending') return -1;
          if (aStatus !== 'pending' && bStatus === 'pending') return 1;
          return 0;
        });
      });
      
      // Emit event to refresh other contexts
      eventBus.emit('studentRejected', { studentId });
      
      // Invalidate caches to refresh other pages
      apiService.invalidateCache('students');
      apiService.invalidateCache('special-students');
      
      toast.success('Student registration rejected!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error(`Error rejecting student: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, []);

  const handleDelete = useCallback(async (studentId) => {
    if (window.confirm('Are you sure you want to permanently delete this student registration? This will only remove from pending list, not from students list.')) {
      try {
        await apiService.request(`/pending-students/${studentId}/reject`, { method: 'DELETE' });
        setPendingStudents(prev => prev.filter(s => s.id !== studentId));
        
        // Emit event to refresh other contexts
        eventBus.emit('pendingStudentDeleted', { studentId });
        
        toast.success('Student registration deleted from pending list!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        toast.error(`Error deleting student: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  }, []);

  const generatePDF = () => {
    const filteredStudents = pendingStudents.filter(student => {
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'pending' && (!student.status || student.status === 'pending')) ||
        student.status === statusFilter;
      const studentType = student.studentType || 'new';
      const typeMatch = typeFilter === 'all' || studentType === typeFilter;
      const classMatch = classFilter === 'all' || student.class === classFilter;
      
      const searchLower = searchTerm.toLowerCase();
      const studentFullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();
      
      const searchMatch = !searchTerm || 
        studentFullName.includes(searchLower) ||
        student.firstName?.toLowerCase().includes(searchLower) ||
        student.middleName?.toLowerCase().includes(searchLower) ||
        student.lastName?.toLowerCase().includes(searchLower) ||
        student.fatherName?.toLowerCase().includes(searchLower) ||
        student.motherName?.toLowerCase().includes(searchLower);
      
      return statusMatch && typeMatch && classMatch && searchMatch;
    });
    
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    
    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    const statusText = statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
    doc.text(`Bluelight Academy - ${statusText} Student Registrations`, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total ${statusText}: ${filteredStudents.length} | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    
    // Table setup
    const startY = 45;
    const rowHeight = 8;
    const colWidths = [15, 50, 30, 20, 25, 30, 30]; // Adjusted widths
    const colPositions = [];
    let currentX = margin;
    
    colWidths.forEach(width => {
      colPositions.push(currentX);
      currentX += width;
    });
    
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    
    // Draw table
    let yPos = startY;
    
    // Headers
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    
    // Header background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
    
    // Header borders
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    
    // Vertical lines for headers
    colPositions.forEach((pos, index) => {
      doc.line(pos, yPos - 6, pos, yPos + 2);
      if (index === colPositions.length - 1) {
        doc.line(pos + colWidths[index], yPos - 6, pos + colWidths[index], yPos + 2);
      }
    });
    
    // Horizontal lines for headers
    doc.line(margin, yPos - 6, margin + tableWidth, yPos - 6);
    doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
    
    // Header text
    const headers = ['No.', 'Student Name', 'ID', 'Class', 'Type', 'Father Phone', 'Registered Date'];
    headers.forEach((header, index) => {
      doc.text(header, colPositions[index] + 2, yPos, { maxWidth: colWidths[index] - 4 });
    });
    
    yPos += rowHeight + 2;
    
    // Data rows
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    filteredStudents.forEach((student, index) => {
      // Check if we need a new page
      if (yPos + rowHeight > pageHeight - 20) {
        doc.addPage();
        yPos = 30;
      }
      
      // Row background (alternating)
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
      }
      
      // Cell borders
      colPositions.forEach((pos, colIndex) => {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(pos, yPos - 6, pos, yPos + 2);
        if (colIndex === colPositions.length - 1) {
          doc.line(pos + colWidths[colIndex], yPos - 6, pos + colWidths[colIndex], yPos + 2);
        }
      });
      
      // Horizontal line
      doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
      
      // Cell data
      const studentName = `${student.firstName} ${student.middleName} ${student.lastName}`;
      const rowData = [
        (index + 1).toString(),
        studentName,
        student.id,
        student.class,
        (student.studentType || 'new') === 'new' ? 'New' : 'Existing',
        student.fatherPhone,
        new Date(student.createdAt).toLocaleDateString()
      ];
      
      rowData.forEach((data, colIndex) => {
        doc.text(data, colPositions[colIndex] + 2, yPos, { 
          maxWidth: colWidths[colIndex] - 4,
          align: colIndex === 0 ? 'center' : 'left'
        });
      });
      
      yPos += rowHeight;
    });
    
    // Final bottom border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, margin + tableWidth, yPos);
    
    const filename = statusFilter === 'all' ? 'registered_students.pdf' : `${statusFilter}_registered_students.pdf`;
    doc.save(filename);
  };





  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Pending Students</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
            {canApproveReject ? 'Review and approve student registrations' : 'View pending student registrations'}
          </p>
        </div>
        
        {pendingStudents.length > 0 && (
          <button
            onClick={generatePDF}
            className="btn-secondary flex items-center space-x-2 w-fit"
            title="Export pending students to PDF"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{pendingStudents.filter(student => {
                const studentType = student.studentType || 'new';
                const typeMatch = typeFilter === 'all' || studentType === typeFilter;
                const classMatch = classFilter === 'all' || student.class === classFilter;
                
                const searchLower = searchTerm.toLowerCase();
                const studentFullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();
                const searchMatch = !searchTerm || 
                  studentFullName.includes(searchLower) ||
                  student.firstName?.toLowerCase().includes(searchLower) ||
                  student.middleName?.toLowerCase().includes(searchLower) ||
                  student.lastName?.toLowerCase().includes(searchLower) ||
                  student.fatherName?.toLowerCase().includes(searchLower) ||
                  student.motherName?.toLowerCase().includes(searchLower);
                
                return typeMatch && classMatch && searchMatch;
              }).length}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{pendingStudents.filter(student => {
                const statusMatch = !student.status || student.status === 'pending';
                const studentType = student.studentType || 'new';
                const typeMatch = typeFilter === 'all' || studentType === typeFilter;
                const classMatch = classFilter === 'all' || student.class === classFilter;
                
                const searchLower = searchTerm.toLowerCase();
                const studentFullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();
                const searchMatch = !searchTerm || 
                  studentFullName.includes(searchLower) ||
                  student.firstName?.toLowerCase().includes(searchLower) ||
                  student.middleName?.toLowerCase().includes(searchLower) ||
                  student.lastName?.toLowerCase().includes(searchLower) ||
                  student.fatherName?.toLowerCase().includes(searchLower) ||
                  student.motherName?.toLowerCase().includes(searchLower);
                
                return statusMatch && typeMatch && classMatch && searchMatch;
              }).length}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{pendingStudents.filter(student => {
                const today = new Date();
                const studentDate = new Date(student.createdAt);
                const isToday = today.toDateString() === studentDate.toDateString();
                const studentType = student.studentType || 'new';
                const typeMatch = typeFilter === 'all' || studentType === typeFilter;
                const classMatch = classFilter === 'all' || student.class === classFilter;
                
                const searchLower = searchTerm.toLowerCase();
                const studentFullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();
                const searchMatch = !searchTerm || 
                  studentFullName.includes(searchLower) ||
                  student.firstName?.toLowerCase().includes(searchLower) ||
                  student.middleName?.toLowerCase().includes(searchLower) ||
                  student.lastName?.toLowerCase().includes(searchLower) ||
                  student.fatherName?.toLowerCase().includes(searchLower) ||
                  student.motherName?.toLowerCase().includes(searchLower);
                
                return isToday && typeMatch && classMatch && searchMatch;
              }).length}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Today's Registrations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Students</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Types</option>
                <option value="new">New (አዲስ)</option>
                <option value="existing">Existing (ነባር)</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Class:</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Classes</option>
                <option value="KG-1">KG-1 (ጀማሪ)</option>
                <option value="KG-2">KG-2 (ደረጃ 1)</option>
                <option value="KG-3">KG-3 (ደረጃ 2)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
        <div className="overflow-x-auto" style={{ width: '100%' }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading pending students...</p>
            </div>
          ) : pendingStudents.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Father Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Registered Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingStudents.filter(student => {
                  const statusMatch = statusFilter === 'all' || 
                    (statusFilter === 'pending' && (!student.status || student.status === 'pending')) ||
                    student.status === statusFilter;
                  const studentType = student.studentType || 'new';
                  const typeMatch = typeFilter === 'all' || studentType === typeFilter;
                  const classMatch = classFilter === 'all' || student.class === classFilter;
                  
                  const searchLower = searchTerm.toLowerCase();
                  const studentFullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();
                  
                  const searchMatch = !searchTerm || 
                    studentFullName.includes(searchLower) ||
                    student.firstName?.toLowerCase().includes(searchLower) ||
                    student.middleName?.toLowerCase().includes(searchLower) ||
                    student.lastName?.toLowerCase().includes(searchLower) ||
                    student.fatherName?.toLowerCase().includes(searchLower) ||
                    student.motherName?.toLowerCase().includes(searchLower);
                  
                  return statusMatch && typeMatch && classMatch && searchMatch;
                }).map((student) => (
                  <PendingStudentRow 
                    key={student.id} 
                    student={student} 
                    canApproveReject={canApproveReject}
                    canDeletePending={canDeletePending}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No pending student registrations</p>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default PendingStudents;