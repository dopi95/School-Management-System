import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Filter, Trash2, Users, UserX, Edit, CheckSquare, Square, FileText, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useSpecialStudents } from '../context/SpecialStudentsContext.jsx';
import DeleteModal from '../components/DeleteModal.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { exportSpecialStudentsToPDF, exportSpecialStudentsToExcel } from '../utils/exportUtils.js';

const SpecialStudents = () => {
  const { t, language } = useLanguage();
  const { specialStudentsList, loading, updateSpecialStudentStatus, deleteSpecialStudent, bulkUpdateSpecialStudents } = useSpecialStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classEditModal, setClassEditModal] = useState({ isOpen: false, newClass: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const classes = ['KG-1', 'KG-2', 'KG-3'];
  const sections = ['A', 'B', 'C', 'D'];

  const filteredStudents = useMemo(() => {
    return specialStudentsList.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        student.name?.toLowerCase().includes(searchLower) ||
        student.id?.toLowerCase().includes(searchLower) ||
        student.joinedYear?.includes(searchTerm) ||
        student.fatherName?.toLowerCase().includes(searchLower) ||
        student.motherName?.toLowerCase().includes(searchLower) ||
        student.fatherPhone?.includes(searchTerm) ||
        student.motherPhone?.includes(searchTerm) ||
        `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchLower);
      const matchesClass = classFilter === 'all' || student.class === classFilter;
      const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
      const isActive = student.status === 'active';
      return matchesSearch && matchesClass && matchesSection && isActive;
    }).sort((a, b) => {
      const classOrder = { 'KG-1': 1, 'KG-2': 2, 'KG-3': 3 };
      const sectionOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
      const classComparison = classOrder[a.class || ''] - classOrder[b.class || ''];
      if (classComparison !== 0) return classComparison;
      return (sectionOrder[a.section || ''] || 0) - (sectionOrder[b.section || ''] || 0);
    });
  }, [specialStudentsList, searchTerm, classFilter, sectionFilter]);

  const handleDeleteClick = (student) => {
    setDeleteModal({ isOpen: true, student });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSpecialStudent(deleteModal.student.id);
      setDeleteModal({ isOpen: false, student: null });
      setSuccessModal({
        isOpen: true,
        title: 'Special Student Deleted!',
        message: `${deleteModal.student.name} has been successfully deleted.`
      });
    } catch (error) {
      alert('Error deleting special student: ' + error.message);
    }
  };

  const handleStatusToggle = async (studentId) => {
    try {
      const student = specialStudentsList.find(s => s.id === studentId);
      const newStatus = student.status === 'active' ? 'inactive' : 'active';
      await updateSpecialStudentStatus(studentId, newStatus);
      setSuccessModal({
        isOpen: true,
        title: 'Status Updated!',
        message: `${student.name} has been marked as ${newStatus}.`
      });
    } catch (error) {
      alert('Error updating special student status: ' + error.message);
    }
  };

  const { activeStudents, inactiveStudents } = useMemo(() => {
    const active = specialStudentsList.filter(s => s.status === 'active').length;
    const inactive = specialStudentsList.filter(s => s.status === 'inactive').length;
    return { activeStudents: active, inactiveStudents: inactive };
  }, [specialStudentsList]);

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, student: null });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleBulkInactive = async () => {
    try {
      await bulkUpdateSpecialStudents(selectedStudents, { status: 'inactive' });
      setSuccessModal({
        isOpen: true,
        title: 'Special Students Updated!',
        message: `${selectedStudents.length} special students have been marked as inactive.`
      });
      setSelectedStudents([]);
    } catch (error) {
      alert('Error updating special students: ' + error.message);
    }
  };

  const handleBulkClassEdit = async () => {
    if (classEditModal.newClass) {
      try {
        await bulkUpdateSpecialStudents(selectedStudents, { class: classEditModal.newClass });
        setSuccessModal({
          isOpen: true,
          title: 'Classes Updated!',
          message: `${selectedStudents.length} special students have been moved to ${classEditModal.newClass}.`
        });
        setSelectedStudents([]);
        setClassEditModal({ isOpen: false, newClass: '' });
      } catch (error) {
        alert('Error updating classes: ' + error.message);
      }
    }
  };

  const isAllSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

  return (
    <div className="space-y-6" style={{ 
      zoom: '0.9', 
      minWidth: '100%', 
      maxWidth: '100vw',
      position: 'relative',
      overflow: 'visible'
    }}>
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Special Students</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Manage special student information and records</p>
        </div>
        
        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
          {/* Export Buttons Row */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const dataToExport = selectedStudents.length > 0 
                  ? filteredStudents.filter(s => selectedStudents.includes(s.id))
                  : filteredStudents;
                const title = selectedStudents.length > 0 
                  ? `Selected Special Students (${selectedStudents.length})`
                  : 'Special Students List';
                exportSpecialStudentsToPDF(dataToExport, title, language);
              }}
              className="btn-secondary flex items-center space-x-1 text-xs lg:text-sm px-2 py-1 lg:px-4 lg:py-2"
              title={selectedStudents.length > 0 ? 'Export Selected to PDF' : 'Export Filtered to PDF'}
            >
              <FileText className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => {
                const dataToExport = selectedStudents.length > 0 
                  ? filteredStudents.filter(s => selectedStudents.includes(s.id))
                  : filteredStudents;
                const filename = selectedStudents.length > 0 
                  ? `selected_special_students_${selectedStudents.length}`
                  : 'special_students_list';
                exportSpecialStudentsToExcel(dataToExport, filename, language);
              }}
              className="btn-secondary flex items-center space-x-1 text-xs lg:text-sm px-2 py-1 lg:px-4 lg:py-2"
              title={selectedStudents.length > 0 ? 'Export Selected to Excel' : 'Export Filtered to Excel'}
            >
              <FileSpreadsheet className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>Excel</span>
            </button>
            <Link
              to="/special-students/add"
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs lg:text-sm px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>Add Special Student</span>
            </Link>
          </div>
          
          {/* Bulk Actions Row */}
          {selectedStudents.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBulkInactive}
                className="btn-secondary flex items-center space-x-1 text-xs lg:text-sm px-2 py-1 lg:px-4 lg:py-2"
              >
                <UserX className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Inactive All Selected</span>
                <span className="sm:hidden">Inactive</span>
              </button>
              <button
                onClick={() => setClassEditModal({ isOpen: true, newClass: '' })}
                className="btn-secondary flex items-center space-x-1 text-xs lg:text-sm px-2 py-1 lg:px-4 lg:py-2"
              >
                <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Edit Class of Selected</span>
                <span className="sm:hidden">Edit Class</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Count Cards */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:gap-6" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'visible'
      }}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{specialStudentsList.length}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Total Special Students</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{activeStudents}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Active Special Students</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <UserX className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{inactiveStudents}</p>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Inactive Special Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-6 border border-gray-200 dark:border-gray-700" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'visible',
        zIndex: 10
      }}>
        <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-3 py-2 pl-9 lg:pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex gap-2 lg:gap-4">
            {/* Class Filter */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-32 px-3 py-2 pl-9 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none text-sm lg:text-base"
                >
                  <option value="all">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Section Filter */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-36 px-3 py-2 pl-9 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none text-sm lg:text-base"
                >
                  <option value="all">All Sections</option>
                  {sections.map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {specialStudentsList.length > 0 && (
        <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span>Select All</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {(student.firstName || student.name).charAt(0)}
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/special-students/${student.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {student.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.phone}
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {student.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/special-students/${student.id}`}
                        className="text-primary-600 hover:text-primary-700"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/special-students/edit/${student.id}`}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit Student"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleStatusToggle(student.id)}
                        className={student.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        title={student.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'}
                      >
                        <UserX className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete Student"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Results Count */}
      {specialStudentsList.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredStudents.length} of {specialStudentsList.length} special students
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.student?.name}
        itemType="Special Student"
      />

      {/* Class Edit Modal */}
      {classEditModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Class for Selected Special Students
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedStudents.length} special students selected
            </p>
            <select
              value={classEditModal.newClass}
              onChange={(e) => setClassEditModal(prev => ({ ...prev, newClass: e.target.value }))}
              className="input-field w-full mb-4"
            >
              <option value="">Select New Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <div className="flex space-x-3">
              <button
                onClick={handleBulkClassEdit}
                disabled={!classEditModal.newClass}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Update Classes
              </button>
              <button
                onClick={() => setClassEditModal({ isOpen: false, newClass: '' })}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        actionText="Continue"
      />
    </div>
  );
};

export default SpecialStudents;