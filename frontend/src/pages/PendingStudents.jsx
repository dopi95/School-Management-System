import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, X, Users, Clock, Download } from 'lucide-react';
import apiService from '../services/api.js';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import jsPDF from 'jspdf';
import 'react-toastify/dist/ReactToastify.css';

const PendingStudentRow = React.memo(({ student, canApproveReject, onApprove, onReject }) => {
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {student.fatherPhone}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {new Date(student.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-3">
          {canApproveReject && (
            <>
              <button
                onClick={() => onApprove(student.id, 'regular')}
                className="text-green-600 hover:text-green-700"
                title="Approve as Student"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => onApprove(student.id, 'special')}
                className="text-purple-600 hover:text-purple-700"
                title="Approve as SP Student"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => onReject(student.id)}
                className="text-red-600 hover:text-red-700"
                title="Reject"
              >
                <X className="w-5 h-5" />
              </button>
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

  
  const canApproveReject = admin?.role === 'superadmin' || admin?.role === 'admin';

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
      setPendingStudents(response || []);
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
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
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
    if (window.confirm('Are you sure you want to reject this student registration? This action cannot be undone.')) {
      try {
        await apiService.request(`/pending-students/${studentId}/reject`, { method: 'DELETE' });
        setPendingStudents(prev => prev.filter(s => s.id !== studentId));
        toast.success('Student registration rejected and removed!', {
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
    }
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    
    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Bluelight Academy - Pending Student Registrations', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Pending: ${pendingStudents.length} | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    
    // Table setup
    const startY = 45;
    const rowHeight = 8;
    const colWidths = [15, 60, 35, 25, 35, 35]; // Adjusted widths
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
    doc.setFontSize(9);
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
    const headers = ['No.', 'Student Name', 'ID', 'Class', 'Father Phone', 'Registered Date'];
    headers.forEach((header, index) => {
      doc.text(header, colPositions[index] + 2, yPos, { maxWidth: colWidths[index] - 4 });
    });
    
    yPos += rowHeight + 2;
    
    // Data rows
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    pendingStudents.forEach((student, index) => {
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
    
    doc.save('pending_students.pdf');
  };





  return (
    <div className="min-h-screen">
      <div className="space-y-4 lg:space-y-6 max-w-full">
        {/* Header - Fixed */}
        <div className="px-4 lg:px-0 w-full">
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">Pending Students</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">
            {canApproveReject ? 'Review and approve student registrations' : 'View pending student registrations'}
          </p>
        </div>

        {/* Count Card and Export - Fixed */}
        <div className="px-4 lg:px-0 w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:p-6 border border-gray-200 dark:border-gray-700 w-full max-w-sm">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{pendingStudents.length}</p>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 truncate">Pending Registrations</p>
              </div>
            </div>
          </div>
          
          {pendingStudents.length > 0 && (
            <div className="ml-5 lg:ml-0">
              <button
                onClick={generatePDF}
                className="btn-secondary flex items-center space-x-1 text-xs lg:text-sm px-2 py-1 lg:px-4 lg:py-2"
                title="Export pending students to PDF"
              >
                <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Table Container - Only table scrolls */}
        <div className="px-4 lg:px-0 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full">
            {loading ? (
              <div className="text-center py-12 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading pending students...</p>
              </div>
            ) : pendingStudents.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{minWidth: '800px'}}>
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
                    {pendingStudents.map((student) => (
                      <PendingStudentRow 
                        key={student.id} 
                        student={student} 
                        canApproveReject={canApproveReject}

                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 w-full">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No pending student registrations</p>
              </div>
            )}
          </div>
        </div>
      </div>



      <ToastContainer />
    </div>
  );
};

export default PendingStudents;