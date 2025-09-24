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
  const { studentsList, loading, addStudent, updateStudent } = useStudents();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    dateOfBirth: '',
    joinedYear: '',
    address: '',
    class: '',
    section: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    photo: ''
  });
  
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const classes = ['KG-1', 'KG-2', 'KG-3'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (isEdit && id && !loading && studentsList.length > 0) {
      const student = studentsList.find(s => s.id === id);
      if (student) {
        setFormData({
          id: student.id || '',
          name: student.name || '',
          email: student.email || '',
          dateOfBirth: student.dateOfBirth || '',
          joinedYear: student.joinedYear || '',
          address: student.address || '',
          class: student.class || '',
          section: student.section || '',
          fatherName: student.fatherName || '',
          fatherPhone: student.fatherPhone || student.phone || '',
          motherName: student.motherName || '',
          motherPhone: student.motherPhone || '',
          photo: student.photo || ''
        });
      }
    }
  }, [isEdit, id, studentsList, loading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateId = () => {
    const existingIds = studentsList.map(s => parseInt(s.id.replace('ST', '')));
    const maxId = Math.max(...existingIds, 0);
    return `ST${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Generate ID if not provided
    const finalId = formData.id.trim() || generateId();
    
    // Check for duplicate ID when adding new student
    if (!isEdit && studentsList.some(s => s.id === finalId)) {
      alert('Student ID already exists. Please use a different ID.');
      return;
    }
    
    const studentData = {
      ...formData,
      id: finalId,
      phone: formData.fatherPhone, // Use father's phone as main phone
      status: 'active',
      payments: {},
      joinedYear: formData.joinedYear || new Date().getFullYear().toString() // Default to current year if empty
    };

    try {
      if (isEdit) {
        await updateStudent(id, studentData);
        setSuccessModal({
          isOpen: true,
          title: 'Student Updated!',
          message: `${formData.name || 'Student'} has been successfully updated.`
        });
      } else {
        await addStudent(studentData);
        setSuccessModal({
          isOpen: true,
          title: 'Student Added!',
          message: `${formData.name || 'New student'} has been successfully added to the system.`
        });
      }
    } catch (error) {
      alert('Error: ' + error.message);
      return;
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
    navigate('/students');
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
            
            {/* Photo Upload */}
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                {formData.photo ? (
                  <img src={formData.photo} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-gray-400 text-sm">4x4 Photo</div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student Photo (4x4)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., ST001 (optional - auto-generated if empty)"
                />
              </div>

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
                  Joined Year
                </label>
                <input
                  type="text"
                  name="joinedYear"
                  value={formData.joinedYear}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 2024"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
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