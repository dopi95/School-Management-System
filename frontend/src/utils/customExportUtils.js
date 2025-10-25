import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportCustomPDF = (data, selectedFields, title, language = 'en') => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const tableWidth = pageWidth - (margin * 2);
    
    // Add title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    
    if (data.length === 0) {
      doc.setFontSize(12);
      doc.text('No data to export', pageWidth / 2, 40, { align: 'center' });
    } else {
      // Calculate column widths
      const colWidth = tableWidth / selectedFields.length;
      let yPos = 35;
      
      // Draw table header
      doc.setFillColor(59, 130, 246); // Blue background
      doc.rect(margin, yPos, tableWidth, 10, 'F');
      
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      
      selectedFields.forEach((field, i) => {
        const x = margin + (i * colWidth) + 2;
        doc.text(field.label.substring(0, 12), x, yPos + 7);
      });
      
      yPos += 10;
      
      // Draw table rows
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      
      data.forEach((item, rowIndex) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 249, 250); // Light gray
          doc.rect(margin, yPos, tableWidth, 8, 'F');
        }
        
        // Draw cell borders and content
        selectedFields.forEach((field, colIndex) => {
          const x = margin + (colIndex * colWidth);
          const value = getNestedValue(item, field.key);
          const cellText = String(value || '').substring(0, 15);
          
          // Draw cell border
          doc.setDrawColor(200, 200, 200);
          doc.rect(x, yPos, colWidth, 8);
          
          // Add text
          doc.text(cellText, x + 2, yPos + 6);
        });
        
        yPos += 8;
      });
      
      // Draw final border
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.rect(margin, 35, tableWidth, yPos - 35);
    }
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.height - 10);
    doc.text(`Total Records: ${data.length}`, pageWidth - margin - 30, doc.internal.pageSize.height - 10);
    
    // Save the PDF
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('PDF Export Error:', error);
    alert(`Error generating PDF: ${error.message}`);
  }
};

export const exportCustomExcel = (data, selectedFields, filename) => {
  // Prepare data for Excel
  const excelData = data.map(item => {
    const row = {};
    selectedFields.forEach(field => {
      row[field.label] = getNestedValue(item, field.key) || '';
    });
    return row;
  });
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  // Save the file
  const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Field definitions for different data types
export const getStudentFields = () => [
  { key: 'id', label: 'Student ID' },
  { key: 'name', label: 'Full Name' },
  { key: 'firstName', label: 'First Name' },
  { key: 'middleName', label: 'Middle Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'firstNameAm', label: 'First Name (Amharic)' },
  { key: 'middleNameAm', label: 'Middle Name (Amharic)' },
  { key: 'lastNameAm', label: 'Last Name (Amharic)' },
  { key: 'gender', label: 'Gender' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'age', label: 'Age' },
  { key: 'class', label: 'Class' },
  { key: 'section', label: 'Section' },
  { key: 'joinedYear', label: 'Joined Year' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'fatherPhone', label: 'Father Phone' },
  { key: 'fatherOccupation', label: 'Father Occupation' },
  { key: 'motherName', label: 'Mother Name' },
  { key: 'motherPhone', label: 'Mother Phone' },
  { key: 'motherOccupation', label: 'Mother Occupation' },
  { key: 'emergencyContact', label: 'Emergency Contact' },
  { key: 'emergencyPhone', label: 'Emergency Phone' },
  { key: 'medicalInfo', label: 'Medical Information' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' }
];

export const getEmployeeFields = () => [
  { key: 'id', label: 'Employee ID' },
  { key: 'name', label: 'Full Name' },
  { key: 'firstName', label: 'First Name' },
  { key: 'middleName', label: 'Middle Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'gender', label: 'Gender' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'address', label: 'Address' },
  { key: 'position', label: 'Position' },
  { key: 'department', label: 'Department' },
  { key: 'salary', label: 'Salary' },
  { key: 'hireDate', label: 'Hire Date' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'experience', label: 'Experience' },
  { key: 'emergencyContact', label: 'Emergency Contact' },
  { key: 'emergencyPhone', label: 'Emergency Phone' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' }
];

export const getPaymentFields = () => [
  { key: 'studentId', label: 'Student ID' },
  { key: 'studentName', label: 'Student Name' },
  { key: 'class', label: 'Class' },
  { key: 'section', label: 'Section' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'amount', label: 'Amount' },
  { key: 'paymentDate', label: 'Payment Date' },
  { key: 'paymentMethod', label: 'Payment Method' },
  { key: 'status', label: 'Payment Status' },
  { key: 'description', label: 'Description' },
  { key: 'receiptNumber', label: 'Receipt Number' },
  { key: 'createdAt', label: 'Created Date' }
];