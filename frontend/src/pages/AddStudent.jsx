import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStudents } from '../context/StudentsContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

const AddStudent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const { studentsList, setStudentsList } = useStudents();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    address: '',
    class: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: ''
  });
  
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const classes = ['KG-1', 'KG-2', 'KG-3'];

  useEffect(() => {
    if (isEdit && id) {
      const student = studentsList.find(s => s.id === id);
      if (student) {
        setFormData({
          name: student.name || '',
          email: student.email || '',
          dateOfBirth: student.dateOfBirth || '',
          address: student.address || '',
          class: student.class || '',
          fatherName: student.fatherName || '',
          fatherPhone: student.fatherPhone || student.phone || '',
          motherName: student.motherName || '',
          motherPhone: student.motherPhone || ''
        });
      }
    }
  }, [isEdit, id, studentsList]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateId = () => {
    const existingIds = studentsList.map(s => parseInt(s.id.replace('ST', '')));
    const maxId = Math.max(...existingIds, 0);
    return `ST${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const studentData = {
      ...formData,
      phone: formData.fatherPhone, // Use father's phone as main phone
      status: 'active',
      payments: {}
    };

    if (isEdit) {
      setStudentsList(prev => prev.map(student => 
        student.id === id ? { ...student, ...studentData } : student
      ));
      setSuccessModal({
        isOpen: true,
        title: 'Student Updated!',
        message: `${formData.name || 'Student'} has been successfully updated.`
      });
    } else {
      const newStudent = {
        id: generateId(),
        ...studentData
      };
      setStudentsList(prev => [...prev, newStudent]);
      setSuccessModal({
        isOpen: true,
        title: 'Student Added!',
        message: `${formData.name || 'New student'} has been successfully added to the system.`
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
    navigate('/students');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/students" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Student' : 'Add Student'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEdit ? 'Update student information' : 'Add new student to the system'}
          </p>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Class
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parent Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Father Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Father Phone
                </label>
                <input
                  type="tel"
                  name="fatherPhone"
                  value={formData.fatherPhone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mother Name
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mother Phone
                </label>
                <input
                  type="tel"
                  name="motherPhone"
                  value={formData.motherPhone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>{isEdit ? 'Update Student' : 'Save Student'}</span>
            </button>
            <Link to="/students" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleSuccessClose}
        title={successModal.title}
        message={successModal.message}
        actionText="View Students"
      />
    </div>
  );
};

export default AddStudent;