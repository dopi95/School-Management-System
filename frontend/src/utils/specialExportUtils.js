import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Special Students PDF Export - Separate Implementation
export const exportSpecialStudentsToPDF = (students, title = 'Special Students List', language = 'en', filename = null) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`Bluelight Academy - ${title}`, pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Total: ${students.length} | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Table configuration
  const startY = 45;
  const rowHeight = 8;
  const specialColWidths = [12, 70, 30, 35, 25, 15, 20, 18];
  const specialColPositions = [];
  let currentX = margin;
  
  specialColWidths.forEach(width => {
    specialColPositions.push(currentX);
    currentX += width;
  });
  
  const tableWidth = specialColWidths.reduce((sum, width) => sum + width, 0);
  let yPos = startY;
  
  // Table headers
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
  
  const specialHeaders = ['#', 'Full Name', 'ID', 'Payment Code', 'Phone', 'Class', 'Section', 'Gender'];
  specialHeaders.forEach((header, index) => {
    doc.text(header, specialColPositions[index] + 2, yPos, { maxWidth: specialColWidths[index] - 4 });
  });
  
  // Header borders
  specialColPositions.forEach((pos, index) => {
    doc.line(pos, yPos - 6, pos, yPos + 2);
    if (index === specialColPositions.length - 1) {
      doc.line(pos + specialColWidths[index], yPos - 6, pos + specialColWidths[index], yPos + 2);
    }
  });
  doc.line(margin, yPos - 6, margin + tableWidth, yPos - 6);
  doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
  
  yPos += rowHeight + 2;
  
  // Table data
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  students.forEach((student, index) => {
    if (yPos + rowHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 30;
    }
    
    // Get full name
    let fullName;
    if (language === 'am' && student.firstNameAm && student.middleNameAm && student.lastNameAm) {
      fullName = `${student.firstNameAm} ${student.middleNameAm} ${student.lastNameAm}`;
    } else if (student.firstName && student.middleName && student.lastName) {
      fullName = `${student.firstName} ${student.middleName} ${student.lastName}`;
    } else {
      fullName = student.name || 'N/A';
    }
    
    // Alternating row colors
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 6, tableWidth, rowHeight, 'F');
    }
    
    // Row data array - must match headers exactly
    const specialRowData = [
      (index + 1).toString(),                                                    // #
      fullName,                                                                  // Full Name
      student.id || 'N/A',                                                     // ID
      student.paymentCode && student.paymentCode.trim() !== '' ? student.paymentCode : 'N/A', // Payment Code
      student.fatherPhone || student.phone || 'N/A',                          // Phone
      student.class || 'N/A',                                                 // Class
      student.section || 'N/A',                                               // Section
      student.gender ? (student.gender === 'male' ? 'Male' : 'Female') : 'N/A' // Gender
    ];
    
    // Print data
    specialRowData.forEach((data, colIndex) => {
      doc.text(data, specialColPositions[colIndex] + 2, yPos, { 
        maxWidth: specialColWidths[colIndex] - 4,
        align: colIndex === 0 ? 'center' : 'left'
      });
    });
    
    // Cell borders
    specialColPositions.forEach((pos, colIndex) => {
      doc.setDrawColor(200, 200, 200);
      doc.line(pos, yPos - 6, pos, yPos + 2);
      if (colIndex === specialColPositions.length - 1) {
        doc.line(pos + specialColWidths[colIndex], yPos - 6, pos + specialColWidths[colIndex], yPos + 2);
      }
    });
    doc.line(margin, yPos + 2, margin + tableWidth, yPos + 2);
    
    yPos += rowHeight;
  });
  
  // Final border
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPos, margin + tableWidth, yPos);
  
  // Save file
  const pdfFilename = filename || title.toLowerCase().replace(/\s+/g, '_');
  doc.save(`${pdfFilename}.pdf`);
};

// Special Students Excel Export
export const exportSpecialStudentsToExcel = (students, filename = 'special_students_list', language = 'en') => {
  const worksheetData = students.map((student, index) => {
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
      'Joined Year': student.joinedYear || 'N/A',
      'Address': student.address || 'N/A'
    };
  });
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
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
    { wch: 12 },  // Joined Year
    { wch: 30 }   // Address
  ];
  worksheet['!cols'] = columnWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Special Students');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}.xlsx`);
};