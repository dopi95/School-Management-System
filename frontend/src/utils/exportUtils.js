import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// PDF Export Functions
export const exportStudentsToPDF = (students, title = 'Students List', language = 'en') => {
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
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};

// Special Students PDF Export (without payment code)
export const exportSpecialStudentsToPDF = (students, title = 'Special Students List', language = 'en') => {
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
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};

export const exportEmployeesToPDF = (employees, title = 'Employees List') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Table headers
  const headers = ['#', 'Name', 'Phone', 'Role', 'Classes', 'Status'];
  let yPosition = 50;
  
  // Header row
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  headers.forEach((header, index) => {
    doc.text(header, 15 + (index * 30), yPosition);
  });
  
  // Data rows
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  yPosition += 10;
  
  employees.forEach((employee, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    const classes = employee.classes && employee.classes.length > 0 
      ? employee.classes.join(', ') 
      : '-';
    
    const rowData = [
      (index + 1).toString(),
      employee.name.substring(0, 15),
      employee.phone || 'N/A',
      (employee.position || employee.role || 'N/A').substring(0, 12),
      classes.substring(0, 12),
      employee.status || 'active'
    ];
    
    rowData.forEach((data, colIndex) => {
      doc.text(String(data), 15 + (colIndex * 30), yPosition);
    });
    
    yPosition += 8;
  });
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
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
      'Full Name': fullName,
      'ID': student.id || 'N/A',
      'Payment Code': student.paymentCode || 'N/A',
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
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Special Students');
  
  // Generate Excel file and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}.xlsx`);
};

export const exportEmployeesToExcel = (employees, filename = 'employees_list') => {
  const worksheetData = employees.map((employee, index) => ({
    '#': index + 1,
    'Name': employee.name,
    'Phone': employee.phone || 'N/A',
    'Role': employee.position || employee.role || 'N/A',
    'Classes': employee.classes && employee.classes.length > 0 
      ? employee.classes.join(', ') 
      : '-',
    'Status': employee.status || 'active',
    'Address': employee.address || 'N/A',
    'Hire Date': employee.hireDate || 'N/A'
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  
  // Generate Excel file and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}.xlsx`);
};