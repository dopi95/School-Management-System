import React, { useState, useEffect, useMemo } from 'react';
import { Book, Package, Search, Calendar, Users, Trash2, Bell, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStudents } from '../context/StudentsContext.jsx';
import { useSpecialStudents } from '../context/SpecialStudentsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import OtherPaymentExportDropdown from '../components/OtherPaymentExportDropdown.jsx';
import jsPDF from 'jspdf';

import apiService from '../services/api';

const OtherPayments = () => {
  try {
    const { admin } = useAuth();
    
    // Check if user has permission to view this page - allow admin and executive roles
    if (admin?.role !== 'superadmin' && admin?.role !== 'admin' && admin?.role !== 'user') {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Access denied. You don't have permission to view Other Payments.</p>
        </div>
      );
    }
  const { studentsList = [], loadStudents, loading: studentsLoading } = useStudents() || {};
  const { specialStudentsList = [], loadSpecialStudents, loading: specialStudentsLoading } = useSpecialStudents() || {};
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(() => {
    return localStorage.getItem('otherPaymentsYear') || new Date().getFullYear().toString();
  });
  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [otherPayments, setOtherPayments] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [description, setDescription] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const years = Array.from({ length: 34 }, (_, i) => 2017 + i);
  const classes = ['KG-1', 'KG-2', 'KG-3'];
  const sections = ['A', 'B', 'C', 'D'];

  // Force load students if not loaded
  React.useEffect(() => {
    if (loadStudents && studentsList.length === 0 && !studentsLoading) {
      loadStudents();
    }
    if (loadSpecialStudents && specialStudentsList.length === 0 && !specialStudentsLoading) {
      loadSpecialStudents();
    }
  }, [loadStudents, loadSpecialStudents, studentsList.length, specialStudentsList.length, studentsLoading, specialStudentsLoading]);

  useEffect(() => {
    localStorage.setItem('otherPaymentsYear', selectedYear);
    fetchPayments();
  }, [selectedYear]);

  // Load pending students count
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

  const allStudents = useMemo(() => {
    const activeStudents = studentsList.filter(s => s.status === 'active').map(s => ({ 
      ...s, 
      type: s.paymentCode && s.paymentCode.trim() !== '' ? 'regular' : 'special'
    }));
    const activeSpecialStudents = specialStudentsList.filter(s => s.status === 'active').map(s => ({ 
      ...s, 
      type: s.paymentCode && s.paymentCode.trim() !== '' ? 'regular' : 'special'
    }));
    return [...activeStudents, ...activeSpecialStudents];
  }, [studentsList, specialStudentsList]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      const fullName = student.firstName && student.middleName 
        ? `${student.firstName} ${student.middleName}` 
        : student.name || student.fullName;
      const studentId = student.id || student.studentId;
      
      // Build comprehensive search strings for parents
      const searchLower = searchTerm.toLowerCase();
      
      // Father name variations
      const fatherNames = [
        student.fatherName,
        student.fatherFirstName,
        student.fatherMiddleName,
        student.fatherLastName,
        `${student.fatherFirstName || ''} ${student.fatherMiddleName || ''}`.trim(),
        `${student.fatherFirstName || ''} ${student.fatherLastName || ''}`.trim(),
        `${student.fatherFirstName || ''} ${student.fatherMiddleName || ''} ${student.fatherLastName || ''}`.trim()
      ].filter(name => name && name.trim());
      
      // Mother name variations
      const motherNames = [
        student.motherName,
        student.motherFirstName,
        student.motherMiddleName,
        student.motherLastName,
        `${student.motherFirstName || ''} ${student.motherMiddleName || ''}`.trim(),
        `${student.motherFirstName || ''} ${student.motherLastName || ''}`.trim(),
        `${student.motherFirstName || ''} ${student.motherMiddleName || ''} ${student.motherLastName || ''}`.trim()
      ].filter(name => name && name.trim());
      
      // Payment descriptions
      const studentId2 = student.id || student.studentId;
      const bookKey = `${studentId2}_book`;
      const stationaryKey = `${studentId2}_stationary`;
      const bookPayment = otherPayments[bookKey];
      const stationaryPayment = otherPayments[stationaryKey];
      const paymentDescriptions = [
        bookPayment?.description,
        stationaryPayment?.description
      ].filter(desc => desc && desc.trim());
      
      const matchesSearch = fullName?.toLowerCase().includes(searchLower) ||
                           studentId?.toLowerCase().includes(searchLower) ||
                           fatherNames.some(name => name.toLowerCase().includes(searchLower)) ||
                           motherNames.some(name => name.toLowerCase().includes(searchLower)) ||
                           paymentDescriptions.some(desc => desc.toLowerCase().includes(searchLower));
      const matchesClass = classFilter === 'all' || student.class === classFilter;
      const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
      const matchesType = typeFilter === 'all' || student.type === typeFilter;
      
      // Payment status filter
      let matchesPayment = true;
      if (paymentFilter !== 'all') {
        if (paymentFilter === 'paid-book') {
          matchesPayment = bookPayment?.paid === true;
        } else if (paymentFilter === 'unpaid-book') {
          matchesPayment = !bookPayment?.paid;
        } else if (paymentFilter === 'paid-stationary') {
          matchesPayment = stationaryPayment?.paid === true;
        } else if (paymentFilter === 'unpaid-stationary') {
          matchesPayment = !stationaryPayment?.paid;
        }
      }
      
      return matchesSearch && matchesClass && matchesSection && matchesType && matchesPayment;
    });
  }, [allStudents, searchTerm, classFilter, sectionFilter, typeFilter, paymentFilter, otherPayments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const paymentsRes = await apiService.request(`/other-payments?year=${selectedYear}`);
      
      const paymentsMap = {};
      paymentsRes.forEach(payment => {
        const key = `${payment.studentId}_${payment.type}`;
        paymentsMap[key] = payment;
      });
      setOtherPayments(paymentsMap);
    } catch (error) {
      toast.error('Failed to fetch payments data');
    } finally {
      setLoading(false);
    }
  };

  const hasCreatePermission = admin?.role === 'superadmin' || admin?.role === 'admin';
  const hasDeletePermission = admin?.role === 'superadmin' || admin?.role === 'admin';

  const handlePaymentClick = (student, paymentType) => {
    const studentId = student.id || student.studentId;
    const key = `${studentId}_${paymentType}`;
    const existingPayment = otherPayments[key];
    
    if (existingPayment?.paid) {
      // If already paid, unpay it (only if has delete permission)
      if (hasDeletePermission) {
        handleUnpayPayment(student, paymentType);
      }
      return;
    }

    // Only allow creating payments if has create permission
    if (hasCreatePermission) {
      setCurrentPayment({ student, paymentType, key });
      setDescription(existingPayment?.description || '');
      setShowDescModal(true);
    }
  };

  const handleUnpayPayment = async (student, paymentType) => {
    const studentId = student.id || student.studentId;
    const key = `${studentId}_${paymentType}`;
    const existingPayment = otherPayments[key];
    
    console.log('Unpay payment:', { studentId, paymentType, key, existingPayment });
    
    if (!existingPayment) {
      toast.error('Payment record not found');
      return;
    }

    // Check if payment has _id (MongoDB) or id field
    const paymentId = existingPayment._id || existingPayment.id;
    if (!paymentId) {
      toast.error('Payment ID not found');
      console.error('Payment missing ID:', existingPayment);
      return;
    }

    try {
      console.log('Deleting payment with ID:', paymentId);
      
      // Delete the payment record from database
      await apiService.request(`/other-payments/${paymentId}`, {
        method: 'DELETE'
      });
      
      // Remove from local state immediately
      setOtherPayments(prev => {
        const newPayments = { ...prev };
        delete newPayments[key];
        return newPayments;
      });

      toast.success('Payment unmarked successfully');
      
    } catch (error) {
      console.error('Payment unpay error:', error);
      toast.error('Failed to unmark payment: ' + (error.message || 'Unknown error'));
      
      // Refresh payments to get current state from server
      await fetchPayments();
    }
  };

  const handlePaymentSave = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const studentId = currentPayment.student.id || currentPayment.student.studentId;
    const paymentData = {
      studentId: studentId,
      studentType: currentPayment.student.type,
      type: currentPayment.paymentType,
      year: selectedYear,
      description: description.trim(),
      paid: true,
      paidAt: new Date()
    };

    // Update UI immediately for fast response
    setOtherPayments(prev => ({
      ...prev,
      [currentPayment.key]: {
        ...paymentData,
        id: 'temp-' + Date.now() // Temporary ID
      }
    }));

    // Close modal immediately
    setShowDescModal(false);
    setCurrentPayment(null);
    setDescription('');
    toast.success('Payment recorded successfully');

    try {
      // Save to database in background
      const response = await apiService.request('/other-payments', {
        method: 'POST',
        body: paymentData
      });
      
      // Update with real database ID
      setOtherPayments(prev => ({
        ...prev,
        [currentPayment.key]: {
          ...paymentData,
          id: response.id || response._id,
          _id: response._id || response.id
        }
      }));
      
    } catch (error) {
      console.error('Payment save error:', error);
      toast.error('Failed to save payment to database');
      
      // Revert UI change on error
      setOtherPayments(prev => {
        const newPayments = { ...prev };
        delete newPayments[currentPayment.key];
        return newPayments;
      });
    }
  };

  const getPaymentStatus = (student, paymentType) => {
    const studentId = student.id || student.studentId;
    const key = `${studentId}_${paymentType}`;
    return otherPayments[key];
  };

  const generatePDF = (status, type) => {
    const studentsToExport = allStudents.filter(student => {
      const payment = getPaymentStatus(student, type);
      return status === 'paid' ? payment?.paid : !payment?.paid;
    });
    
    if (studentsToExport.length === 0) {
      toast.error(`No ${status} ${type} payments found for ${selectedYear}`);
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    
    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    const title = `Bluelight Academy - ${status.charAt(0).toUpperCase() + status.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)} Payments`;
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Year: ${selectedYear} | Total: ${studentsToExport.length} | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    
    // Table setup
    const startY = 45;
    const rowHeight = 10;
    const colWidths = status === 'paid' ? [15, 60, 30, 25, 20, 80] : [15, 70, 35, 30, 25];
    const colPositions = [];
    let currentX = margin;
    
    colWidths.forEach(width => {
      colPositions.push(currentX);
      currentX += width;
    });
    
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    let yPos = startY;
    
    // Headers
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
    
    const headers = status === 'paid' 
      ? ['#', 'Student Name', 'ID', 'Class', 'Type', 'Description']
      : ['#', 'Student Name', 'ID', 'Class', 'Type'];
    
    headers.forEach((header, index) => {
      doc.text(header, colPositions[index] + 2, yPos, { maxWidth: colWidths[index] - 4 });
    });
    
    // Draw borders
    colPositions.forEach((pos, index) => {
      doc.line(pos, yPos - 6, pos, yPos + 4);
      if (index === colPositions.length - 1) {
        doc.line(pos + colWidths[index], yPos - 6, pos + colWidths[index], yPos + 4);
      }
    });
    doc.line(margin, yPos - 6, margin + tableWidth, yPos - 6);
    doc.line(margin, yPos + 4, margin + tableWidth, yPos + 4);
    
    yPos += rowHeight + 4;
    
    // Data rows
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    studentsToExport.forEach((student, index) => {
      if (yPos + rowHeight > pageHeight - 20) {
        doc.addPage();
        yPos = 30;
      }
      
      const studentName = student.firstName && student.middleName 
        ? `${student.firstName} ${student.middleName}` 
        : student.name || student.fullName;
      
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
      }
      
      const payment = getPaymentStatus(student, type);
      const rowData = status === 'paid'
        ? [
            (index + 1).toString(),
            studentName,
            student.id || student.studentId,
            `${student.class} ${student.section || ''}`.trim(),
            student.type,
            payment?.description || 'No description'
          ]
        : [
            (index + 1).toString(),
            studentName,
            student.id || student.studentId,
            `${student.class} ${student.section || ''}`.trim(),
            student.type
          ];
      
      rowData.forEach((data, colIndex) => {
        doc.text(data, colPositions[colIndex] + 2, yPos, { 
          maxWidth: colWidths[colIndex] - 4,
          align: colIndex === 0 ? 'center' : 'left'
        });
      });
      
      // Cell borders
      colPositions.forEach((pos, colIndex) => {
        doc.setDrawColor(200, 200, 200);
        doc.line(pos, yPos - 6, pos, yPos + 4);
        if (colIndex === colPositions.length - 1) {
          doc.line(pos + colWidths[colIndex], yPos - 6, pos + colWidths[colIndex], yPos + 4);
        }
      });
      doc.line(margin, yPos + 4, margin + tableWidth, yPos + 4);
      
      yPos += rowHeight;
    });
    
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPos, margin + tableWidth, yPos);
    
    const fileName = `${status}_${type}_payments_${selectedYear}.pdf`;
    doc.save(fileName);
  };

  // Show loading state
  if (studentsLoading || specialStudentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Calculate payment statistics for filtered students
  const paymentStats = useMemo(() => {
    const stats = {
      totalStudents: filteredStudents.length,
      paidBook: 0,
      unpaidBook: 0,
      paidStationary: 0,
      unpaidStationary: 0
    };

    filteredStudents.forEach(student => {
      const bookPayment = getPaymentStatus(student, 'book');
      const stationaryPayment = getPaymentStatus(student, 'stationary');
      
      if (bookPayment?.paid) {
        stats.paidBook++;
      } else {
        stats.unpaidBook++;
      }
      
      if (stationaryPayment?.paid) {
        stats.paidStationary++;
      } else {
        stats.unpaidStationary++;
      }
    });

    return stats;
  }, [filteredStudents, otherPayments, selectedYear]);

  // Show message if no students found
  if (!studentsLoading && !specialStudentsLoading && allStudents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Students Found</h2>
          <p className="text-gray-600 dark:text-gray-400">Please add students first to manage other payments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom Lists Button */}
      <div className="flex justify-start">
        <Link
          to="/custom-payment-lists"
          className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Custom Payment Lists</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Other Payments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Manage book and stationary payments for students</p>
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
          <Link to="/pending-students" className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 dark:border-gray-700 hidden lg:block" style={{ marginRight: '50px' }}>
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Export Options */}
      <div className="flex justify-center items-center mb-6">
        {OtherPaymentExportDropdown && (
          <OtherPaymentExportDropdown
            onExportPaidBook={() => generatePDF('paid', 'book')}
            onExportUnpaidBook={() => generatePDF('unpaid', 'book')}
            onExportPaidStationary={() => generatePDF('paid', 'stationary')}
            onExportUnpaidStationary={() => generatePDF('unpaid', 'stationary')}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Book className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{paymentStats.paidBook}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Paid Book ({selectedYear})</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <Book className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{paymentStats.unpaidBook}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Unpaid Book ({selectedYear})</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{paymentStats.paidStationary}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Paid Stationary ({selectedYear})</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{paymentStats.unpaidStationary}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Unpaid Stationary ({selectedYear})</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="space-y-4">
          {/* Year Selection - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-gray-200 dark:border-gray-600">
            {/* Year Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
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

            {/* Payment Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="input-field pl-10 pr-10 appearance-none"
              >
                <option value="all">All Payment Status</option>
                <option value="paid-book">Paid for Book</option>
                <option value="unpaid-book">Unpaid for Book</option>
                <option value="paid-stationary">Paid for Stationary</option>
                <option value="unpaid-stationary">Unpaid for Stationary</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Student Type Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field pl-10 pr-10 appearance-none"
              >
                <option value="all">All Types</option>
                <option value="regular">Regular Students</option>
                <option value="special">Special Students</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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

            {/* Class Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="input-field pl-10 pr-10 appearance-none"
              >
                <option value="all">All Classes</option>
                <option value="KG-1">KG-1 (ጀማሪ)</option>
                <option value="KG-2">KG-2 (ደረጃ 1)</option>
                <option value="KG-3">KG-3 (ደረጃ 2)</option>
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
                <option value="A">A (ሀ)</option>
                <option value="B">B (ለ)</option>
                <option value="C">C (ሐ)</option>
                <option value="D">D (መ)</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || classFilter !== 'all' || sectionFilter !== 'all' || typeFilter !== 'all' || paymentFilter !== 'all') && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setClassFilter('all');
                  setSectionFilter('all');
                  setTypeFilter('all');
                  setPaymentFilter('all');
                }}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
        <div className="overflow-x-auto" style={{ width: '100%' }}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Book Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Book Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stationary Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stationary Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Students Found</h3>
                      <p className="text-sm">
                        {paymentFilter === 'paid-book' 
                          ? `No students with paid book payments found for ${selectedYear}`
                          : paymentFilter === 'unpaid-book'
                          ? `No students with unpaid book payments found for ${selectedYear}`
                          : paymentFilter === 'paid-stationary'
                          ? `No students with paid stationary payments found for ${selectedYear}`
                          : paymentFilter === 'unpaid-stationary'
                          ? `No students with unpaid stationary payments found for ${selectedYear}`
                          : 'No students match the current filters'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const bookPayment = getPaymentStatus(student, 'book');
                  const stationaryPayment = getPaymentStatus(student, 'stationary');
                  
                  const studentId = student.id || student.studentId;
                  const fullName = student.firstName && student.middleName 
                    ? `${student.firstName} ${student.middleName}` 
                    : student.name || student.fullName;
                  
                  return (
                    <tr key={`${studentId}_${student.type}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {studentId} | Class: {student.class} {student.section} | Type: {student.type}
                            {student.paymentCode && <span> | Code: {student.paymentCode}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {bookPayment?.paid ? (
                          hasDeletePermission ? (
                            <button
                              onClick={() => handlePaymentClick(student, 'book')}
                              className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm mx-auto cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
                              title="Click to unmark as paid"
                            >
                              <Book className="w-4 h-4" />
                              <span>Paid</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm mx-auto bg-green-100 text-green-800">
                              <Book className="w-4 h-4" />
                              <span>Paid</span>
                            </div>
                          )
                        ) : (
                          hasCreatePermission ? (
                            <button
                              onClick={() => handlePaymentClick(student, 'book')}
                              className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm mx-auto cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200"
                              title="Click to mark as paid"
                            >
                              <Book className="w-4 h-4" />
                              <span>Pay</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm mx-auto bg-red-100 text-red-600">
                              <Book className="w-4 h-4" />
                              <span>Unpaid</span>
                            </div>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-900 dark:text-white flex-1">
                            {bookPayment?.description || (bookPayment?.paid ? 'No description' : '-')}
                          </div>
                          {bookPayment?.paid && hasDeletePermission && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUnpayPayment(student, 'book');
                              }}
                              className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Remove payment and description"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {stationaryPayment?.paid ? (
                          hasDeletePermission ? (
                            <button
                              onClick={() => handlePaymentClick(student, 'stationary')}
                              className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm mx-auto cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
                              title="Click to unmark as paid"
                            >
                              <Package className="w-4 h-4" />
                              <span>Paid</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm mx-auto bg-green-100 text-green-800">
                              <Package className="w-4 h-4" />
                              <span>Paid</span>
                            </div>
                          )
                        ) : (
                          hasCreatePermission ? (
                            <button
                              onClick={() => handlePaymentClick(student, 'stationary')}
                              className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm mx-auto cursor-pointer bg-purple-100 text-purple-800 hover:bg-purple-200"
                              title="Click to mark as paid"
                            >
                              <Package className="w-4 h-4" />
                              <span>Pay</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm mx-auto bg-red-100 text-red-600">
                              <Package className="w-4 h-4" />
                              <span>Unpaid</span>
                            </div>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-900 dark:text-white flex-1">
                            {stationaryPayment?.description || (stationaryPayment?.paid ? 'No description' : '-')}
                          </div>
                          {stationaryPayment?.paid && hasDeletePermission && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUnpayPayment(student, 'stationary');
                              }}
                              className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Remove payment and description"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Description Modal */}
      {showDescModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {currentPayment?.paymentType === 'book' ? 'Book' : 'Stationary'} Payment Description
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Student: {currentPayment?.student.firstName && currentPayment?.student.middleName 
                  ? `${currentPayment.student.firstName} ${currentPayment.student.middleName}` 
                  : currentPayment?.student.name || currentPayment?.student.fullName}
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter payment description..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDescModal(false);
                  setCurrentPayment(null);
                  setDescription('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('OtherPayments error:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading Other Payments page</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Reload Page
        </button>
      </div>
    );
  }
};

export default OtherPayments;