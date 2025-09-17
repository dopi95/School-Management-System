import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, GraduationCap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import DeleteModal from '../components/DeleteModal.jsx';

const Teachers = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, teacher: null });
  const [teachersList, setTeachersList] = useState([
    { id: 'T001', name: 'Dr. Sarah Connor', phone: '+251911234567', subject: 'Mathematics', status: 'Active' },
    { id: 'T002', name: 'Mr. John Doe', phone: '+251922345678', subject: 'English', status: 'Active' },
    { id: 'T003', name: 'Ms. Jane Smith', phone: '+251933456789', subject: 'Science', status: 'Active' },
    { id: 'T004', name: 'Prof. Mike Johnson', phone: '+251944567890', subject: 'Art', status: 'Active' },
    { id: 'T005', name: 'Dr. Emily Davis', phone: '+251955678901', subject: 'Music', status: 'Active' }
  ]);

  const filteredTeachers = teachersList.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.phone.includes(searchTerm)
  );

  const handleDeleteClick = (teacher) => {
    setDeleteModal({ isOpen: true, teacher });
  };

  const handleDeleteConfirm = () => {
    setTeachersList(prev => prev.filter(t => t.id !== deleteModal.teacher.id));
    setDeleteModal({ isOpen: false, teacher: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, teacher: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('teachers')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage teacher information and records</p>
        </div>
        <Link to="/teachers/add" className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>{t('addTeacher')}</span>
        </Link>
      </div>

      {/* Count Card */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{teachersList.length}</p>
            <p className="text-gray-600 dark:text-gray-400">Total Teachers</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('teacherName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('phoneNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('subject')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {teacher.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {teacher.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {teacher.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/teachers/${teacher.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(teacher)}
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

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredTeachers.length} of {teachersList.length} teachers
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.teacher?.name}
        itemType="Teacher"
      />
    </div>
  );
};

export default Teachers;