import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// PDF Export Functions
export const exportStudentsToPDF = (students, title = 'Students List', language = 'en', filename = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  const rowHeight = 8;
  
  // Add title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Table headers
  const headers = ['#', 'Full Name', 'ID', 'Payment Code', 'Class', 'Section', 'Mother Name'];
  const colWidths = [15, 40, 25, 25, 20, 20, 35];
  let yPosition = 45;
  
  // Draw table border
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  
  // Header row background
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, tableWidth, rowHeight, 'F');
  
  // Header row
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  let xPos = margin;
  
  headers.forEach((header, index) => {
    doc.text(header, xPos + 2, yPosition + 5);
    xPos += colWidths[index];
  });
  
  // Draw header borders
  xPos = margin;
  for (let i = 0; i <= headers.length; i++) {
    doc.line(xPos, yPosition, xPos, yPosition + rowHeight);
    if (i < headers.length) xPos += colWidths[i];
  }
  doc.line(margin, yPosition, margin + tableWidth, yPosition);
  doc.line(margin, yPosition + rowHeight, margin + tableWidth, yPosition + rowHeight);
  
  // Data rows
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  yPosition += rowHeight;
  
  students.forEach((student, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Get full name based on language
    let fullName;
    if (language === 'am' && student.firstNameAm && student.middleNameAm && student.lastNameAm) {
      fullName = `${student.firstNameAm} ${student.middleNameAm} ${student.lastNameAm}`;
    } else if (student.firstName && student.middleName && student.lastName) {
      fullName = `${student.firstName} ${student.middleName} ${student.lastName}`;
    } else {
      fullName = student.name || 'N/A';
    }
    
    const rowData = [
      (index + 1).toString(),
      fullName.substring(0, 25),
      student.id || 'N/A',
      student.paymentCode || 'N/A',
      student.class || 'N/A',
      student.section || 'N/A',
      (student.motherName || 'N/A').substring(0, 20)
    ];
    
    // Draw row data
    xPos = margin;
    rowData.forEach((data, colIndex) => {
      doc.text(String(data), xPos + 2, yPosition + 5);
      xPos += colWidths[colIndex];
    });
    
    // Draw row borders
    xPos = margin;
    for (let i = 0; i <= headers.length; i++) {
      doc.line(xPos, yPosition, xPos, yPosition + rowHeight);
      if (i < headers.length) xPos += colWidths[i];
    }
    doc.line(margin, yPosition + rowHeight, margin + tableWidth, yPosition + rowHeight);
    
    yPosition += rowHeight;
  });
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  const pdfFilename = filename || title.toLowerCase().replace(/\s+/g, '_');
  doc.save(`${pdfFilename}.pdf`);
};

// Special Students PDF Export (without payment code)
export const exportSpecialStudentsToPDF = (students, title = 'Special Students List', language = 'en', filename = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  const rowHeight = 8;
  
  // Add title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Table headers
  const headers = ['#', 'Full Name', 'ID', 'Class', 'Section', 'Mother Name'];
  const colWidths = [15, 45, 25, 20, 20, 35];
  let yPosition = 45;
  
  // Draw table border
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  
  // Header row background
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, tableWidth, rowHeight, 'F');
  
  // Header row
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  let xPos = margin;
  
  headers.forEach((header, index) => {
    doc.text(header, xPos + 2, yPosition + 5);
    xPos += colWidths[index];
  });
  
  // Draw header borders
  xPos = margin;
  for (let i = 0; i <= headers.length; i++) {
    doc.line(xPos, yPosition, xPos, yPosition + rowHeight);
    if (i < headers.length) xPos += colWidths[i];
  }
  doc.line(margin, yPosition, margin + tableWidth, yPosition);
  doc.line(margin, yPosition + rowHeight, margin + tableWidth, yPosition + rowHeight);
  
  // Data rows
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  yPosition += rowHeight;
  
  students.forEach((student, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Get full name based on language
    let fullName;
    if (language === 'am' && student.firstNameAm && student.middleNameAm && student.lastNameAm) {
      fullName = `${student.firstNameAm} ${student.middleNameAm} ${student.lastNameAm}`;
    } else if (student.firstName && student.middleName && student.lastName) {
      fullName = `${student.firstName} ${student.middleName} ${student.lastName}`;
    } else {
      fullName = student.name || 'N/A';
    }
    
    const rowData = [
      (index + 1).toString(),
      fullName.substring(0, 30),
      student.id || 'N/A',
      student.class || 'N/A',
      student.section || 'N/A',
      (student.motherName || 'N/A').substring(0, 20)
    ];
    
    // Draw row data
    xPos = margin;
    rowData.forEach((data, colIndex) => {
      doc.text(String(data), xPos + 2, yPosition + 5);
      xPos += colWidths[colIndex];
    });
    
    // Draw row borders
    xPos = margin;
    for (let i = 0; i <= headers.length; i++) {
      doc.line(xPos, yPosition, xPos, yPosition + rowHeight);
      if (i < headers.length) xPos += colWidths[i];
    }
    doc.line(margin, yPosition + rowHeight, margin + tableWidth, yPosition + rowHeight);
    
    yPosition += rowHeight;
  });
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  const pdfFilename = filename || title.toLowerCase().replace(/\s+/g, '_');
  doc.save(`${pdfFilename}.pdf`);
};

export const exportEmployeesToPDF = (employees, title = 'Employees List') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  const rowHeight = 8;
  
  // Add title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Table headers
  const headers = ['#', 'ID', 'Full Name', 'Phone', 'Role', 'Teaching Class'];
  const colWidths = [15, 25, 40, 30, 25, 35];
  let yPosition = 45;
  
  // Draw table border
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  
  // Header row background
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, tableWidth, rowHeight, 'F');
  
  // Header row
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  let xPos = margin;
  
  headers.forEach((header, index) => {
    doc.text(header, xPos + 2, yPosition + 5);
    xPos += colWidths[index];
  });
  
  // Draw header borders
  xPos = margin;
  for (let i = 0; i <= headers.length; i++) {
    doc.line(xPos, yPosition, xPos, yPosition + rowHeight);
    if (i < headers.length) xPos += colWidths[i];
  }
  doc.line(margin, yPosition, margin + tableWidth, yPosition);
  doc.line(margin, yPosition + rowHeight, margin + tableWidth, yPosition + rowHeight);
  
  // Data rows
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  yPosition += rowHeight;
  
  employees.forEach((employee, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 30;
    }
    
    const teachingClass = ((employee.position === 'Teacher' || employee.role === 'Teacher') && (employee.teachingGradeLevel || employee.classes)) 
      ? (employee.teachingGradeLevel || employee.classes || []).join(', ') 
      : '-';
    
    const rowData = [
      (index + 1).toString(),
      employee.id || 'N/A',
      (employee.fullName || employee.name || 'N/A').substring(0, 25),
      employee.phone || 'N/A',
      (employee.role || employee.position || 'N/A').substring(0, 15),
      teachingClass.substring(0, 20)
    ];
    
    // Draw row data
    xPos = margin;
    rowData.forEach((data, colIndex) => {
      doc.text(String(data), xPos + 2, yPosition + 5);
      xPos += colWidths[colIndex];
    });
    
    // Draw row borders
    xPos = margin;
    for (let i = 0; i <= headers.length; i++) {
      doc.line(xPos, yPosition, xPos, yPosition + rowHeight);
      if (i < headers.length) xPos += colWidths[i];
    }
    doc.line(margin, yPosition + rowHeight, margin + tableWidth, yPosition + rowHeight);
    
    yPosition += rowHeight;
  });
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};

// Helper function to generate dynamic filename
export const generateFilename = (baseFilename, classFilter, sectionFilter, selectedCount = 0) => {
  let filename = baseFilename;
  
  if (selectedCount > 0) {
    filename += `_selected_${selectedCount}`;
  } else {
    if (classFilter && classFilter !== 'all') {
      filename += `_${classFilter.toLowerCase()}`;
      if (sectionFilter && sectionFilter !== 'all') {
        filename += `_section_${sectionFilter.toLowerCase()}`;
      }
    } else if (sectionFilter && sectionFilter !== 'all') {
      filename += `_section_${sectionFilter.toLowerCase()}`;
    }
  }
  
  return filename;
};

// Excel Export Functions
export const exportStudentsToExcel = (students, filename = 'students_list', language = 'en') => {
  const worksheetData = students.map((student, index) => {
    // Get full name based on language
    let fullName;
    if (language === 'am' && student.firstNameAm && student.middleNameAm && student.lastNameAm) {
      fullName = `${student.firstNameAm} ${student.middleNameAm} ${student.lastNameAm}`;
    } else if (student.firstName && student.middleName && student.lastName) {
      fullName = `${student.firstName} ${student.middleName} ${student.lastName}`;
    } else {
      fullName = student.name || 'N/A';
    }
    
    return {
      '#': index + 1,
      'Student ID': student.id || '',
      'First Name': student.firstName || '',
      'Middle Name': student.middleName || '',
      'Last Name': student.lastName || '',
      'First Name (Amharic)': student.firstNameAm || '',
      'Middle Name (Amharic)': student.middleNameAm || '',
      'Last Name (Amharic)': student.lastNameAm || '',
      'Full Name': fullName,
      'Payment Code': student.paymentCode || '',
      'Gender': student.gender ? (student.gender === 'male' ? 'Male' : 'Female') : '',
      'Email': student.email || '',
      'Date of Birth': student.dateOfBirth || '',
      'Joined Year': student.joinedYear || '',
      'Address': student.address || '',
      'Class': student.class || '',
      'Section': student.section || '',
      'Father Name': student.fatherName || '',
      'Father Phone': student.fatherPhone || '',
      'Mother Name': student.motherName || '',
      'Mother Phone': student.motherPhone || '',
      'Main Phone': student.phone || '',
      'Status': student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Active',
      'Created Date': student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '',
      'Updated Date': student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : ''
    };
  });
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  // Set column widths for better formatting
  const columnWidths = [
    { wch: 5 },   // #
    { wch: 12 },  // Student ID
    { wch: 15 },  // First Name
    { wch: 15 },  // Middle Name
    { wch: 15 },  // Last Name
    { wch: 18 },  // First Name (Amharic)
    { wch: 18 },  // Middle Name (Amharic)
    { wch: 18 },  // Last Name (Amharic)
    { wch: 25 },  // Full Name
    { wch: 12 },  // Payment Code
    { wch: 8 },   // Gender
    { wch: 25 },  // Email
    { wch: 12 },  // Date of Birth
    { wch: 12 },  // Joined Year
    { wch: 30 },  // Address
    { wch: 8 },   // Class
    { wch: 8 },   // Section
    { wch: 20 },  // Father Name
    { wch: 15 },  // Father Phone
    { wch: 20 },  // Mother Name
    { wch: 15 },  // Mother Phone
    { wch: 15 },  // Main Phone
    { wch: 10 },  // Status
    { wch: 12 },  // Created Date
    { wch: 12 }   // Updated Date
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add basic styling (simplified for better compatibility)
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Set row height
  if (range) {
    worksheet['!rows'] = Array(range.e.r + 1).fill({ hpt: 20 });
    worksheet['!rows'][0] = { hpt: 25 }; // Header row height
  }
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  // Generate Excel file and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}.xlsx`);
};

// Special Students Excel Export (without payment code)
export const exportSpecialStudentsToExcel = (students, filename = 'special_students_list', language = 'en') => {
  const worksheetData = students.map((student, index) => {
    // Get full name based on language
    let fullName;
    if (language === 'am' && student.firstNameAm && student.middleNameAm && student.lastNameAm) {
      fullName = `${student.firstNameAm} ${student.middleNameAm} ${student.lastNameAm}`;
    } else if (student.firstName && student.middleName && student.lastName) {
      fullName = `${student.firstName} ${student.middleName} ${student.lastName}`;
    } else {
      fullName = student.name || 'N/A';
    }
    
    return {
      '#': index + 1,
      'Full Name': fullName,
      'ID': student.id || 'N/A',
      'Class': student.class || 'N/A',
      'Section': student.section || 'N/A',
      'Mother Name': student.motherName || 'N/A',
      'Father Name': student.fatherName || 'N/A',
      'Phone': student.phone || 'N/A',
      'Joined Year': student.joinedYear || 'N/A',
      'Address': student.address || 'N/A'
    };
  });
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  // Set column widths for better formatting
  const columnWidths = [
    { wch: 5 },   // #
    { wch: 25 },  // Full Name
    { wch: 12 },  // ID
    { wch: 8 },   // Class
    { wch: 8 },   // Section
    { wch: 20 },  // Mother Name
    { wch: 20 },  // Father Name
    { wch: 15 },  // Phone
    { wch: 12 },  // Joined Year
    { wch: 30 }   // Address
  ];
  worksheet['!cols'] = columnWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Special Students');
  
  // Generate Excel file and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}.xlsx`);
};

export const exportEmployeesToExcel = (employees, filename = 'employees_list') => {
  const worksheetData = employees.map((employee, index) => {
    const teachingClass = ((employee.position === 'Teacher' || employee.role === 'Teacher') && (employee.teachingGradeLevel || employee.classes)) 
      ? (employee.teachingGradeLevel || employee.classes || []).join(', ') 
      : '-';
    
    return {
      '#': index + 1,
      'ID': employee.id || 'N/A',
      'Full Name': employee.fullName || employee.name || 'N/A',
      'Phone': employee.phone || 'N/A',
      'Role': employee.role || employee.position || 'N/A',
      'Teaching Class': teachingClass,
      'Sex': employee.sex || 'N/A',
      'Employment Date': employee.employmentDate || 'N/A',
      'Employment Type': employee.employmentType === 'fulltime' ? 'Full Time' : employee.employmentType === 'parttime' ? 'Part Time' : 'N/A',
      'Qualification Level': employee.qualificationLevel || employee.qualification || 'N/A',
      'Experience': employee.experience || 'N/A',
      'Address': employee.address || 'N/A',
      'Status': employee.status || 'active'
    };
  });
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  // Set column widths for better formatting
  const columnWidths = [
    { wch: 5 },   // #
    { wch: 12 },  // ID
    { wch: 25 },  // Full Name
    { wch: 15 },  // Phone
    { wch: 15 },  // Role
    { wch: 20 },  // Teaching Class
    { wch: 8 },   // Sex
    { wch: 15 },  // Employment Date
    { wch: 15 },  // Employment Type
    { wch: 20 },  // Qualification Level
    { wch: 15 },  // Experience
    { wch: 30 },  // Address
    { wch: 10 }   // Status
  ];
  worksheet['!cols'] = columnWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  
  // Generate Excel file and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}.xlsx`);
};