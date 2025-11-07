import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// PDF Export Functions
export const exportStudentsToPDF = (students, title = 'Students List', language = 'en', filename = null) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Header
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`Bluelight Academy - ${title}`, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Total: ${students.length} | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Table setup
  const startY = 45;
  const rowHeight = 8;
  const colWidths = [15, 70, 45, 40, 25, 25, 30];
  const colPositions = [];
  let currentX = margin;
  
  colWidths.forEach(width => {
    colPositions.push(currentX);
    currentX += width;
  });
  
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  let yPos = startY;
  
  // Headers
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
  
  const headers = ['#', 'Full Name', 'ID', 'Payment Code', 'Class', 'Section', 'Gender'];
  headers.forEach((header, index) => {
    doc.text(header, colPositions[index] + 2, yPos, { maxWidth: colWidths[index] - 4 });
  });
  
  // Draw borders
  colPositions.forEach((pos, index) => {
    doc.line(pos, yPos - 6, pos, yPos + 2);
    if (index === colPositions.length - 1) {
      doc.line(pos + colWidths[index], yPos - 6, pos + colWidths[index], yPos + 2);
    }
  });
  doc.line(margin, yPos - 6, margin + tableWidth, yPos - 6);
  doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
  
  yPos += rowHeight + 2;
  
  // Data rows
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  students.forEach((student, index) => {
    if (yPos + rowHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 30;
    }
    
    let fullName;
    if (language === 'am' && student.firstNameAm && student.middleNameAm && student.lastNameAm) {
      fullName = `${student.firstNameAm} ${student.middleNameAm} ${student.lastNameAm}`;
    } else if (student.firstName && student.middleName && student.lastName) {
      fullName = `${student.firstName} ${student.middleName} ${student.lastName}`;
    } else {
      fullName = student.name || 'N/A';
    }
    
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
    }
    
    const rowData = [
      (index + 1).toString(),
      fullName,
      student.id || 'N/A',
      student.paymentCode && student.paymentCode.trim() !== '' ? student.paymentCode : 'N/A',
      student.class || 'N/A',
      student.section || 'N/A',
      student.gender ? (student.gender === 'male' ? 'Male' : 'Female') : 'N/A'
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
      doc.line(pos, yPos - 6, pos, yPos + 2);
      if (colIndex === colPositions.length - 1) {
        doc.line(pos + colWidths[colIndex], yPos - 6, pos + colWidths[colIndex], yPos + 2);
      }
    });
    doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
    
    yPos += rowHeight;
  });
  
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPos, margin + tableWidth, yPos);
  
  const pdfFilename = filename || title.toLowerCase().replace(/\s+/g, '_');
  doc.save(`${pdfFilename}.pdf`);
};

// Special Students PDF Export (with payment code) - Updated
export const exportSpecialStudentsToPDF = (students, title = 'Special Students List', language = 'en', filename = null) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`Bluelight Academy - ${title}`, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Total: ${students.length} | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  const startY = 45;
  const rowHeight = 8;
  const colWidths = [15, 65, 40, 35, 25, 20, 20, 25];
  const colPositions = [];
  let currentX = margin;
  
  colWidths.forEach(width => {
    colPositions.push(currentX);
    currentX += width;
  });
  
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  let yPos = startY;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
  
  const headers = ['#', 'Full Name', 'ID', 'Payment Code', 'Phone', 'Class', 'Section', 'Gender'];
  headers.forEach((header, index) => {
    doc.text(header, colPositions[index] + 2, yPos, { maxWidth: colWidths[index] - 4 });
  });
  
  colPositions.forEach((pos, index) => {
    doc.line(pos, yPos - 6, pos, yPos + 2);
    if (index === colPositions.length - 1) {
      doc.line(pos + colWidths[index], yPos - 6, pos + colWidths[index], yPos + 2);
    }
  });
  doc.line(margin, yPos - 6, margin + tableWidth, yPos - 6);
  doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
  
  yPos += rowHeight + 2;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  students.forEach((student, index) => {
    if (yPos + rowHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 30;
    }
    
    let fullName;
    if (language === 'am' && student.firstNameAm && student.middleNameAm && student.lastNameAm) {
      fullName = `${student.firstNameAm} ${student.middleNameAm} ${student.lastNameAm}`;
    } else if (student.firstName && student.middleName && student.lastName) {
      fullName = `${student.firstName} ${student.middleName} ${student.lastName}`;
    } else {
      fullName = student.name || 'N/A';
    }
    
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
    }
    
    const rowData = [
      (index + 1).toString(),
      fullName,
      student.id || 'N/A',
      student.paymentCode && student.paymentCode.trim() !== '' ? student.paymentCode : 'N/A',
      student.class || 'N/A',
      student.section || 'N/A',
      student.gender ? (student.gender === 'male' ? 'Male' : 'Female') : 'N/A'
    ];
    
    rowData.forEach((data, colIndex) => {
      doc.text(data, colPositions[colIndex] + 2, yPos, { 
        maxWidth: colWidths[colIndex] - 4,
        align: colIndex === 0 ? 'center' : 'left'
      });
    });
    
    colPositions.forEach((pos, colIndex) => {
      doc.setDrawColor(200, 200, 200);
      doc.line(pos, yPos - 6, pos, yPos + 2);
      if (colIndex === colPositions.length - 1) {
        doc.line(pos + colWidths[colIndex], yPos - 6, pos + colWidths[colIndex], yPos + 2);
      }
    });
    doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
    
    yPos += rowHeight;
  });
  
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPos, margin + tableWidth, yPos);
  
  const pdfFilename = filename || title.toLowerCase().replace(/\s+/g, '_');
  doc.save(`${pdfFilename}.pdf`);
};

export const exportEmployeesToPDF = (employees, title = 'Employees List') => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`Bluelight Academy - ${title}`, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Total: ${employees.length} | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  const startY = 45;
  const rowHeight = 8;
  const colWidths = [15, 30, 50, 35, 30, 40];
  const colPositions = [];
  let currentX = margin;
  
  colWidths.forEach(width => {
    colPositions.push(currentX);
    currentX += width;
  });
  
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  let yPos = startY;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
  
  const headers = ['#', 'ID', 'Full Name', 'Phone', 'Role', 'Teaching Class'];
  headers.forEach((header, index) => {
    doc.text(header, colPositions[index] + 2, yPos, { maxWidth: colWidths[index] - 4 });
  });
  
  colPositions.forEach((pos, index) => {
    doc.line(pos, yPos - 6, pos, yPos + 2);
    if (index === colPositions.length - 1) {
      doc.line(pos + colWidths[index], yPos - 6, pos + colWidths[index], yPos + 2);
    }
  });
  doc.line(margin, yPos - 6, margin + tableWidth, yPos - 6);
  doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
  
  yPos += rowHeight + 2;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  employees.forEach((employee, index) => {
    if (yPos + rowHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 30;
    }
    
    const teachingClass = ((employee.position === 'Teacher' || employee.role === 'Teacher') && (employee.teachingGradeLevel || employee.classes)) 
      ? (employee.teachingGradeLevel || employee.classes || []).join(', ') 
      : '-';
    
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
    }
    
    const rowData = [
      (index + 1).toString(),
      employee.id || 'N/A',
      employee.fullName || employee.name || 'N/A',
      employee.phone || 'N/A',
      employee.role || employee.position || 'N/A',
      teachingClass
    ];
    
    rowData.forEach((data, colIndex) => {
      doc.text(data, colPositions[colIndex] + 2, yPos, { 
        maxWidth: colWidths[colIndex] - 4,
        align: colIndex === 0 ? 'center' : 'left'
      });
    });
    
    colPositions.forEach((pos, colIndex) => {
      doc.setDrawColor(200, 200, 200);
      doc.line(pos, yPos - 6, pos, yPos + 2);
      if (colIndex === colPositions.length - 1) {
        doc.line(pos + colWidths[colIndex], yPos - 6, pos + colWidths[colIndex], yPos + 2);
      }
    });
    doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
    
    yPos += rowHeight;
  });
  
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPos, margin + tableWidth, yPos);
  
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
      'Payment Code': student.paymentCode && student.paymentCode.trim() !== '' ? student.paymentCode : '',
      'Phone Number': student.fatherPhone || student.phone || '',
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
    { wch: 15 },  // Phone Number
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

// Special Students Excel Export (with payment code)
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
      'Payment Code': student.paymentCode && student.paymentCode.trim() !== '' ? student.paymentCode : 'N/A',
      'Phone Number': student.fatherPhone || student.phone || 'N/A',
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
    { wch: 12 },  // Payment Code
    { wch: 15 },  // Phone Number
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