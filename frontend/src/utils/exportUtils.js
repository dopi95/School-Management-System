import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// PDF Export Functions
export const exportStudentsToPDF = (students, title = 'Students List') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Table headers
  const headers = ['#', 'Name', 'ID', 'Phone', 'Class', 'Section', 'Status'];
  let yPosition = 50;
  
  // Header row
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  headers.forEach((header, index) => {
    doc.text(header, 15 + (index * 27), yPosition);
  });
  
  // Data rows
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  yPosition += 10;
  
  students.forEach((student, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    const name = student.firstName && student.middleName 
      ? `${student.firstName} ${student.middleName}` 
      : student.name;
    
    const rowData = [
      (index + 1).toString(),
      name.substring(0, 12),
      student.id,
      student.phone || 'N/A',
      student.class || 'N/A',
      student.section || 'N/A',
      student.status || 'active'
    ];
    
    rowData.forEach((data, colIndex) => {
      doc.text(String(data), 15 + (colIndex * 27), yPosition);
    });
    
    yPosition += 8;
  });
  
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
export const exportStudentsToExcel = (students, filename = 'students_list') => {
  const worksheetData = students.map((student, index) => ({
    '#': index + 1,
    'Name': student.firstName && student.middleName 
      ? `${student.firstName} ${student.middleName}` 
      : student.name,
    'ID': student.id,
    'Phone': student.phone || 'N/A',
    'Class': student.class || 'N/A',
    'Section': student.section || 'N/A',
    'Status': student.status || 'active',
    'Joined Year': student.joinedYear || 'N/A',
    'Address': student.address || 'N/A'
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
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