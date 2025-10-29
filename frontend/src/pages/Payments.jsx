import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Check, CreditCard, Calendar, Users, Search, Filter, FileText, Download, Plus, Trash2, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';
import { usePayments } from '../context/PaymentsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../services/api.js';
import jsPDF from 'jspdf';

const Payments = () => {
  const { t, language } = useLanguage();
  const { admin } = useAuth();
  const { studentsList = [], updateStudentPayment, loadStudents, loading: studentsLoading } = useStudents() || {};
  const { paymentsList = [], loading = false, addPayment } = usePayments() || {};
  
  // Force load students if not loaded
  React.useEffect(() => {
    if (loadStudents && studentsList.length === 0 && !studentsLoading) {
      loadStudents();
    }
  }, [loadStudents, studentsList.length, studentsLoading]);
  
  // Show loading state
  if (studentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Check if user can edit payments (not just view)
  const canEditPayments = admin?.role === 'superadmin' || admin?.permissions?.payments?.edit;
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem('payments-selected-month');
    return saved !== null ? parseInt(saved) : 0; // Start with September (index 0)
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem('payments-selected-year');
    return saved !== null ? parseInt(saved) : 2017;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [descriptionSearchTerm, setDescriptionSearchTerm] = useState(''); // New state for description search
  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [showDescModal, setShowDescModal] = useState({ isOpen: false, student: null });
  const [showHistoryModal, setShowHistoryModal] = useState({ isOpen: false, student: null });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkDescription, setBulkDescription] = useState('');
  const [description, setDescription] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const months = [
    'September', 'October', 'November', 'December', 'January', 'February',
    'March', 'April', 'May', 'June', 'July', 'August'
  ];

  const classes = ['KG-1', 'KG-2', 'KG-3'];
  const sections = ['A', 'B', 'C', 'D'];
  const years = Array.from({ length: 34 }, (_, i) => 2017 + i); // 2017 to 2050

  const currentMonthKey = `${selectedYear}-${selectedMonth}`;
  const activeStudentsList = studentsList.filter(student => student.status === 'active');
  
  const filteredStudents = useMemo(() => {
    return activeStudentsList.filter(student => {
      // Initialize payments object if it doesn't exist
      if (!student.payments) {
        student.payments = {};
      }
      const searchLower = searchTerm.toLowerCase();
      const descriptionSearchLower = descriptionSearchTerm.toLowerCase();
      
      // Main search filter
      const matchesSearch = !searchTerm || 
        student.name?.toLowerCase().includes(searchLower) ||
        student.id?.toLowerCase().includes(searchLower) ||
        student.joinedYear?.includes(searchTerm) ||
        student.fatherName?.toLowerCase().includes(searchLower) ||
        student.motherName?.toLowerCase().includes(searchLower) ||
        student.fatherPhone?.includes(searchTerm) ||
        student.motherPhone?.includes(searchTerm) ||
        `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchLower);
      
      // Description search filter
      const matchesDescriptionSearch = !descriptionSearchTerm || 
        // Check current month payment description
        (student.payments[currentMonthKey]?.description?.toLowerCase().includes(descriptionSearchLower)) ||
        // Check all payment descriptions in history
        Object.values(student.payments || {}).some(payment => 
          payment?.description?.toLowerCase().includes(descriptionSearchLower)
        );
      
      const matchesClass = classFilter === 'all' || student.class === classFilter;
      const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
      
      // Payment status filter for current month/year
      const isPaidCurrentMonth = student.payments[currentMonthKey]?.paid || false;
      const matchesPaymentStatus = paymentStatusFilter === 'all' || 
        (paymentStatusFilter === 'paid' && isPaidCurrentMonth) ||
        (paymentStatusFilter === 'unpaid' && !isPaidCurrentMonth);
      
      // Date range filter for paid students only
      if (showPaidOnly && (dateFromFilter || dateToFilter)) {
        const hasPaidInRange = Object.values(student.payments || {}).some(payment => {
          if (!payment?.paid || !payment?.date) return false;
          
          const paymentDate = new Date(payment.date);
          const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
          const toDate = dateToFilter ? new Date(dateToFilter) : null;
          
          if (fromDate && toDate) {
            return paymentDate >= fromDate && paymentDate <= toDate;
          } else if (fromDate) {
            return paymentDate >= fromDate;
          } else if (toDate) {
            return paymentDate <= toDate;
          }
          return true;
        });
        
        if (!hasPaidInRange) return false;
      }
      
      return matchesSearch && matchesDescriptionSearch && matchesClass && matchesSection && matchesPaymentStatus;
    }).sort((a, b) => {
      const classOrder = { 'KG-1': 1, 'KG-2': 2, 'KG-3': 3 };
      const sectionOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
      const classComparison = classOrder[a.class || ''] - classOrder[b.class || ''];
      if (classComparison !== 0) return classComparison;
      return (sectionOrder[a.section || ''] || 0) - (sectionOrder[b.section || ''] || 0);
    });
  }, [activeStudentsList, searchTerm, descriptionSearchTerm, classFilter, sectionFilter, currentMonthKey, paymentStatusFilter, showPaidOnly, dateFromFilter, dateToFilter]);

  const { paidStudents, unpaidStudents } = useMemo(() => {
    const paid = filteredStudents.filter(student => student.payments[currentMonthKey]?.paid).length;
    const unpaid = filteredStudents.length - paid;
    return { paidStudents: paid, unpaidStudents: unpaid };
  }, [filteredStudents, currentMonthKey]);

  // Load pending students count
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const response = await apiService.request('/pending-students');
        setPendingCount(response.length);
      } catch (error) {
        console.error('Failed to load pending students count:', error);
        setPendingCount(0);
      }
    };

    if (admin?.role === 'superadmin' || admin?.permissions?.pendingStudents?.view) {
      loadPendingCount();
    }
  }, [admin]);

  const generatePDF = (type) => {
    const studentsToExport = type === 'paid' 
      ? filteredStudents.filter(student => student.payments[currentMonthKey]?.paid)
      : filteredStudents.filter(student => !student.payments[currentMonthKey]?.paid);
    
    if (studentsToExport.length === 0) {
      alert(`No ${type} students found for ${months[selectedMonth]} ${selectedYear}`);
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    
    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Bluelight Academy', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Students Report`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`${months[selectedMonth]} ${selectedYear}`, pageWidth / 2, 40, { align: 'center' });
    
    // Filter info
    doc.setFontSize(10);
    let filterText = `Total Students: ${studentsToExport.length}`;
    if (classFilter !== 'all') filterText += ` | Class: ${classFilter}`;
    if (sectionFilter !== 'all') filterText += ` | Section: ${sectionFilter}`;
    if (searchTerm) filterText += ` | Search: "${searchTerm}"`;
    if (descriptionSearchTerm) filterText += ` | Description: "${descriptionSearchTerm}"`;
    doc.text(filterText, pageWidth / 2, 50, { align: 'center' });
    
    // Table headers with better spacing
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    let yPos = 70;
    
    // Column positions
    const cols = {
      no: margin,
      name: margin + 15,
      id: margin + 70,
      class: margin + 105,
      section: margin + 130,
      desc: margin + 155
    };
    
    doc.text('No.', cols.no, yPos);
    doc.text('Student Name', cols.name, yPos);
    doc.text('ID Number', cols.id, yPos);
    doc.text('Class', cols.class, yPos);
    doc.text('Section', cols.section, yPos);
    if (type === 'paid') {
      doc.text('Description', cols.desc, yPos);
    }
    
    // Line under headers
    doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
    
    // Table content
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    yPos += 10;
    
    studentsToExport.forEach((student, index) => {
      const studentName = language === 'am' && student.firstNameAm && student.middleNameAm
        ? `${student.firstNameAm} ${student.middleNameAm}`
        : student.firstName && student.middleName 
        ? `${student.firstName} ${student.middleName}`
        : student.name;
      
      // Calculate row height based on description length
      let rowHeight = 8;
      let descriptionLines = [];
      
      if (type === 'paid' && student.payments[currentMonthKey]?.description) {
        const description = student.payments[currentMonthKey].description;
        const maxWidth = pageWidth - cols.desc - margin;
        const words = description.split(' ');
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = doc.getTextWidth(testLine);
          
          if (textWidth > maxWidth && currentLine) {
            descriptionLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        
        if (currentLine) {
          descriptionLines.push(currentLine);
        }
        
        rowHeight = Math.max(8, descriptionLines.length * 4 + 4);
      }
      
      // Check if we need a new page
      if (yPos + rowHeight > 270) {
        doc.addPage();
        yPos = 30;
      }
      
      // Draw row data
      doc.text((index + 1).toString(), cols.no, yPos);
      doc.text(studentName.length > 25 ? studentName.substring(0, 25) + '...' : studentName, cols.name, yPos);
      doc.text(student.id, cols.id, yPos);
      doc.text(student.class, cols.class, yPos);
      doc.text(student.section || 'N/A', cols.section, yPos);
      
      // Draw description with proper wrapping
      if (type === 'paid' && descriptionLines.length > 0) {
        descriptionLines.forEach((line, lineIndex) => {
          doc.text(line, cols.desc, yPos + (lineIndex * 4));
        });
      }
      
      yPos += rowHeight;
    });
    
    // Footer with better formatting
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, doc.internal.pageSize.height - 10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, doc.internal.pageSize.height - 10);
      doc.setTextColor(0);
    }
    
    // Download
    const fileName = `${type}_students_${months[selectedMonth]}_${selectedYear}.pdf`;
    doc.save(fileName);
  };

  const handlePaymentToggle = async (studentId, isChecked) => {
    if (isChecked) {
      setShowDescModal({ isOpen: true, student: studentsList.find(s => s.id === studentId) });
    } else {
      try {
        console.log('Unchecking payment for student:', studentId, 'monthKey:', currentMonthKey);
        
        // Remove payment record from database
        const paymentToDelete = paymentsList.find(p => 
          p.studentId === studentId && 
          p.month === months[selectedMonth] && 
          p.year === selectedYear.toString()
        );
        
        if (paymentToDelete) {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/${paymentToDelete.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          console.log('Database payment deleted:', response.ok);
        }
        
        // Remove from student payment record - this will delete the entry completely
        const result = await updateStudentPayment(studentId, currentMonthKey, null);
        console.log('Student payment updated:', result);
        
      } catch (error) {
        console.error('Error updating payment:', error);
        alert('Error updating payment: ' + error.message);
      }
    }
  };

  const handleDescSubmit = async () => {
    const student = showDescModal.student;
    try {
      // Add to payments collection
      await addPayment({
        studentId: student.id,
        studentName: language === 'am' && student.firstNameAm && student.middleNameAm
          ? `${student.firstNameAm} ${student.middleNameAm}`
          : student.firstName && student.middleName 
          ? `${student.firstName} ${student.middleName}`
          : student.name,
        month: months[selectedMonth],
        year: selectedYear.toString(),
        description: description
      });

      // Update student payment record
      const paymentData = {
        paid: true,
        date: new Date().toISOString().split('T')[0],
        description: description,
        month: months[selectedMonth],
        year: selectedYear
      };
      await updateStudentPayment(student.id, currentMonthKey, paymentData);
      
      setShowDescModal({ isOpen: false, student: null });
      setDescription('');
    } catch (error) {
      alert('Error recording payment: ' + error.message);
    }
  };

  const getPaymentHistory = (student) => {
    if (!student || !student.payments) {
      return [];
    }
    
    const uniquePayments = new Map();
    
    Object.entries(student.payments)
      .filter(([key, payment]) => {
        // Only show payments that exist, are currently paid, and have required fields
        return payment && 
               payment.paid === true && 
               payment.month && 
               payment.year && 
               payment.date;
      })
      .forEach(([key, payment]) => {
        const uniqueKey = `${payment.month}_${payment.year}`;
        // Only keep the most recent entry for each month/year combination
        if (!uniquePayments.has(uniqueKey) || new Date(payment.date) > new Date(uniquePayments.get(uniqueKey).date)) {
          uniquePayments.set(uniqueKey, { ...payment, key });
        }
      });
    
    return Array.from(uniquePayments.values())
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleDeleteHistory = async (student, paymentKey) => {
    if (!confirm('Are you sure you want to delete this payment history?')) {
      return;
    }
    
    try {
      // Get the payment details from the key
      const payment = student.payments[paymentKey];
      
      // Try to find and delete the payment record from database
      if (payment && paymentsList.length > 0) {
        const paymentToDelete = paymentsList.find(p => 
          p.studentId === student.id && 
          p.month === payment.month && 
          p.year === payment.year.toString()
        );
        
        if (paymentToDelete) {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/${paymentToDelete.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          
          if (!response.ok) {
            console.warn('Failed to delete payment record from database');
          }
        }
      }
      
      // Remove from student payment record (this updates the context immediately)
      await updateStudentPayment(student.id, paymentKey, null);
      
      // Update the modal with the updated student data immediately
      const updatedStudent = studentsList.find(s => s.id === student.id);
      if (updatedStudent) {
        setShowHistoryModal({ isOpen: true, student: updatedStudent });
      }
      
    } catch (error) {
      console.error('Error deleting payment history:', error);
      alert('Error deleting payment history: ' + error.message);
    }
  };

  const handleStudentSelect = (studentId, isSelected) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const unpaidStudents = filteredStudents
        .filter(student => !student.payments[currentMonthKey]?.paid)
        .map(student => student.id);
      setSelectedStudents(unpaidStudents);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleBulkPayment = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students first');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
          month: months[selectedMonth],
          year: selectedYear.toString(),
          description: bulkDescription
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state for each processed student
        for (const studentId of selectedStudents) {
          const paymentData = {
            paid: true,
            date: new Date().toISOString().split('T')[0],
            description: bulkDescription,
            month: months[selectedMonth],
            year: selectedYear
          };
          await updateStudentPayment(studentId, currentMonthKey, paymentData);
        }
        
        alert(`Successfully processed ${result.processed} payments${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`);
      } else {
        alert('Error processing bulk payments: ' + result.message);
      }
    } catch (error) {
      alert('Error processing bulk payments: ' + error.message);
    }
    
    setShowBulkModal(false);
    setSelectedStudents([]);
    setBulkDescription('');
  };

  // Show message if no students found
  if (!studentsLoading && studentsList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Students Found</h2>
          <p className="text-gray-600 dark:text-gray-400">Please add students first to manage payments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ 
      zoom: '0.9', 
      minWidth: '100%', 
      maxWidth: '100vw',
      position: 'relative',
      overflow: 'visible'
    }}>
      <div className="w-full" style={{ maxWidth: '100vw', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Track student payment status by month</p>
          </div>
          
          {(admin?.role === 'superadmin' || admin?.permissions?.pendingStudents?.view) && (
            <Link to="/pending-students" className="relative p-2 ml-3 mr-10 bg-white dark:bg-gray-800 rounded-full shadow hover:shadow-md border border-gray-200 dark:border-gray-700 lg:hidden">
              <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
        </div>
        
        {/* Bell Icon for Desktop */}
        {(admin?.role === 'superadmin' || admin?.permissions?.pendingStudents?.view) && (
          <Link to="/pending-students" className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 dark:border-gray-700 hidden lg:block" style={{ marginRight: '20px' }}>
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:gap-6 mb-6" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'visible'
      }}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700 w-full">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{paidStudents}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Paid Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700 w-full">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{unpaidStudents}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Unpaid Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700 w-full">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{filteredStudents.length}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Total Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700 mb-6" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'visible',
        zIndex: 10
      }}>
        <div className="space-y-4">
          {/* Year and Month Selection - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-gray-200 dark:border-gray-600">
            {/* Year Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <select
                value={selectedYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  setSelectedYear(year);
                  localStorage.setItem('payments-selected-year', year.toString());
                }}
                className="input-field pl-10 pr-10 appearance-none"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Month Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <select
                value={selectedMonth}
                onChange={(e) => {
                  const month = parseInt(e.target.value);
                  setSelectedMonth(month);
                  localStorage.setItem('payments-selected-month', month.toString());
                }}
                className="input-field pl-10 pr-10 appearance-none"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="input-field pl-10 pr-10 appearance-none"
              >
                <option value="all">All Students</option>
                <option value="paid">Paid Students</option>
                <option value="unpaid">Unpaid Students</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Download Links & Bulk Actions */}
            <div className="flex flex-col space-y-2">
              {canEditPayments && (
                <button
                  onClick={() => setShowBulkModal(true)}
                  disabled={selectedStudents.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors w-fit self-start flex items-center space-x-2"
                  title="Mark Selected as Paid"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Selected as Paid ({selectedStudents.length})</span>
                </button>
              )}
              <button
                onClick={() => generatePDF('paid')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors w-fit self-start"
                title="Download Paid Students PDF"
              >
                Download Paid Students
              </button>
              <button
                onClick={() => generatePDF('unpaid')}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors w-fit self-start"
                title="Download Unpaid Students PDF"
              >
                Download Unpaid Students
              </button>
            </div>
          </div>

          {/* Search and Other Filters - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Description Search */}
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by description..."
                value={descriptionSearchTerm}
                onChange={(e) => setDescriptionSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Class Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="input-field pl-10 pr-10 appearance-none"
              >
                <option value="all">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Section Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="input-field pl-10 pr-10 appearance-none"
              >
                <option value="all">All Sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        
        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPaidOnly"
              checked={showPaidOnly}
              onChange={(e) => setShowPaidOnly(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="showPaidOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by payment date range
            </label>
          </div>
          
          {showPaidOnly && (
            <>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">From:</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="input-field text-sm px-2 py-1"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">To:</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="input-field text-sm px-2 py-1"
                />
              </div>
              
              {(dateFromFilter || dateToFilter) && (
                <button
                  onClick={() => {
                    setDateFromFilter('');
                    setDateToFilter('');
                  }}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Clear dates
                </button>
              )}
            </>
          )}
        </div>

        {/* Clear Filters */}
        {(searchTerm || descriptionSearchTerm || classFilter !== 'all' || sectionFilter !== 'all' || paymentStatusFilter !== 'all' || showPaidOnly) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => {
                setSearchTerm('');
                setDescriptionSearchTerm('');
                setClassFilter('all');
                setSectionFilter('all');
                setPaymentStatusFilter('all');
                setShowPaidOnly(false);
                setDateFromFilter('');
                setDateToFilter('');
              }}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {canEditPayments && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length > 0 && selectedStudents.length === filteredStudents.filter(s => !s.payments[currentMonthKey]?.paid).length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => {
                const isPaid = student.payments[currentMonthKey]?.paid || false;
                const isSelected = selectedStudents.includes(student.id);
                const currentPaymentDescription = student.payments[currentMonthKey]?.description;
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {canEditPayments && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleStudentSelect(student.id, e.target.checked)}
                          disabled={isPaid}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {language === 'am' && student.firstNameAm && student.middleNameAm
                            ? `${student.firstNameAm} ${student.middleNameAm}`
                            : student.firstName && student.middleName 
                            ? `${student.firstName} ${student.middleName}`
                            : student.name
                          }
                          </div>
                          {currentPaymentDescription && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Desc: {currentPaymentDescription}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        {student.section || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {canEditPayments ? (
                          <input
                            type="checkbox"
                            checked={isPaid}
                            onChange={(e) => handlePaymentToggle(student.id, e.target.checked)}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                        ) : null}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isPaid 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setShowHistoryModal({ isOpen: true, student })}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <History className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Description Modal */}
      {showDescModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Payment Description
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Student: {showDescModal.student?.name} - {months[selectedMonth]} {selectedYear}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter payment description..."
                  className="input-field w-full h-24 resize-none"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleDescSubmit}
                className="btn-primary flex-1"
              >
                Mark as Paid
              </button>
              <button
                onClick={() => {
                  setShowDescModal({ isOpen: false, student: null });
                  setDescription('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment History - {showHistoryModal.student?.name}
            </h3>
            <div className="space-y-3">
              {getPaymentHistory(showHistoryModal.student).length > 0 ? (
                getPaymentHistory(showHistoryModal.student).map((payment) => (
                  <div key={payment.key || `${payment.month}_${payment.year}`} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.month} {payment.year}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date: {payment.date}
                        </p>

                        {payment.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Description: {payment.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Paid
                        </span>
                        {canEditPayments && (
                          <button
                            onClick={() => handleDeleteHistory(showHistoryModal.student, payment.key)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete this payment history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No payment history found
                </p>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowHistoryModal({ isOpen: false, student: null })}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Payment Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Mark Selected Students as Paid
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedStudents.length} students selected for {months[selectedMonth]} {selectedYear}
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={bulkDescription}
                  onChange={(e) => setBulkDescription(e.target.value)}
                  placeholder="Enter payment description for all selected students..."
                  className="input-field w-full h-24 resize-none"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBulkPayment}
                className="btn-primary flex-1"
              >
                Mark All as Paid
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkDescription('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Payments;