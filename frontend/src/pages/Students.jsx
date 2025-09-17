import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Filter, Trash2, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import DeleteModal from '../components/DeleteModal.jsx';

const Students = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null });
  const [studentsList, setStudentsList] = useState([
    { id: 'ST001', name: 'Alice Johnson', phone: '+251911234567', class: 'KG-1' },
    { id: 'ST002', name: 'Bob Smith', phone: '+251922345678', class: 'KG-2' },
    { id: 'ST003', name: 'Carol Davis', phone: '+251933456789', class: 'KG-3' },
    { id: 'ST004', name: 'David Wilson', phone: '+251944567890', class: 'KG-1' },
    { id: 'ST005', name: 'Eva Brown', phone: '+251955678901', class: 'KG-2' },
    { id: 'ST006', name: 'Frank Miller', phone: '+251966789012', class: 'KG-3' }
  ]);

  const classes = ['KG-1', 'KG-2', 'KG-3'];

  const filteredStudents = studentsList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.phone.includes(searchTerm);
    const matchesClass = classFilter === 'all' || student.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleDeleteClick = (student) => {
    setDeleteModal({ isOpen: true, student });
  };

  const handleDeleteConfirm = () => {
    setStudentsList(prev => prev.filter(s => s.id !== deleteModal.student.id));
    setDeleteModal({ isOpen: false, student: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, student: null });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('students')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage student information and records</p>
        </div>
        <Link
          to="/students/add"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addStudent')}</span>
        </Link>
      </div>

      {/* Count Card */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{studentsList.length}</p>
            <p className="text-gray-600 dark:text-gray-400">Total Students</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('searchStudents')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Class Filter */}
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="input-field pl-10 appearance-none"
              >
                <option value="all">{t('filterByClass')}</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('studentName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('idNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('phoneNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('class')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/students/${student.id}`}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/students/${student.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="text-red-600 hover:text-red-700"
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

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredStudents.length} of {studentsList.length} students
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.student?.name}
        itemType="Student"
      />
    </div>
  );
};

export default Students;