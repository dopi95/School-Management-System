import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useSpecialStudents } from '../context/SpecialStudentsContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

const AddSpecialStudent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const { specialStudentsList, loading, addSpecialStudent, updateSpecialStudent, setIsEditing } = useSpecialStudents();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    middleName: '',
    lastName: '',
    firstNameAm: '',
    middleNameAm: '',
    lastNameAm: '',
    paymentCode: '',
    gender: '',
    name: '', // Keep for backward compatibility
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
    if (isEdit && id && !loading && specialStudentsList.length > 0) {
      const decodedId = decodeURIComponent(id);
      const student = specialStudentsList.find(s => s.id === decodedId);
      if (student) {
        setFormData({
          id: student.id || '',
          firstName: student.firstName || '',
          middleName: student.middleName || '',
          lastName: student.lastName || '',
          firstNameAm: student.firstNameAm || '',
          middleNameAm: student.middleNameAm || '',
          lastNameAm: student.lastNameAm || '',
          paymentCode: student.paymentCode || '',
          gender: student.gender || '',
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
  }, [isEdit, id, specialStudentsList, loading]);

  const handleChange = (e) => {
    setIsEditing(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/[^0-9/]/g, '');
    let numbers = value.replace(/[^0-9]/g, '');
    
    if (numbers.length >= 2) {
      const day = parseInt(numbers.substring(0, 2));
      if (day > 31) numbers = '31' + numbers.substring(2);
      if (day < 1) numbers = '01' + numbers.substring(2);
    }
    
    if (numbers.length >= 4) {
      const month = parseInt(numbers.substring(2, 4));
      if (month > 12) numbers = numbers.substring(0, 2) + '12' + numbers.substring(4);
      if (month < 1) numbers = numbers.substring(0, 2) + '01' + numbers.substring(4);
    }
    
    if (numbers.length > 8) numbers = numbers.substring(0, 8);
    
    let formatted = numbers;
    if (numbers.length >= 3) formatted = numbers.substring(0, 2) + '/' + numbers.substring(2);
    if (numbers.length >= 5) formatted = numbers.substring(0, 2) + '/' + numbers.substring(2, 4) + '/' + numbers.substring(4);
    
    setIsEditing(true);
    setFormData({ ...formData, dateOfBirth: formatted });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsEditing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setIsEditing(true);
    setFormData({ ...formData, photo: '' });
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const generateId = () => {
    const existingIds = specialStudentsList.map(s => parseInt(s.id.replace('SP', '')));
    const maxId = Math.max(...existingIds, 0);
    return `SP${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Generate ID if not provided
    const finalId = formData.id.trim() || generateId();
    
    // Check for duplicate ID when adding new student
    if (!isEdit && specialStudentsList.some(s => s.id === finalId)) {
      alert('Special Student ID already exists. Please use a different ID.');
      return;
    }
    
    const studentData = {
      ...formData,
      id: finalId,
      name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
      phone: formData.fatherPhone, // Use father's phone as main phone
      status: 'active',
      payments: {},
      joinedYear: formData.joinedYear || new Date().getFullYear().toString(), // Default to current year if empty
      section: formData.section || undefined, // Convert empty string to undefined
      dateOfBirth: formData.dateOfBirth || undefined // Ensure empty string becomes undefined
    };

    try {
      if (isEdit) {
        const decodedId = decodeURIComponent(id);
        await updateSpecialStudent(decodedId, studentData);
        setSuccessModal({
          isOpen: true,
          title: 'Special Student Updated!',
          message: `${formData.name || 'Special Student'} has been successfully updated.`
        });
      } else {
        await addSpecialStudent(studentData);
        setSuccessModal({
          isOpen: true,
          title: 'Special Student Added!',
          message: `${formData.name || 'New special student'} has been successfully added to the system.`
        });
      }
    } catch (error) {
      alert('Error: ' + error.message);
      return;
    }
  };

  const handleSuccessClose = () => {
    setIsEditing(false);
    setSuccessModal({ isOpen: false, title: '', message: '' });
    navigate('/special-students');
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
        <Link to="/special-students" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Special Student' : 'Add Special Student'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEdit ? 'Update special student information' : 'Add new special student to the system'}
          </p>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Special Student Information</h3>
            
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
                  className="input-field mb-2"
                />
                {formData.photo && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Photo
                  </button>
                )}
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
                  placeholder="e.g., SP001 (optional - auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Middle Name (Father Name) *
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name (Amharic)
                </label>
                <input
                  type="text"
                  name="firstNameAm"
                  value={formData.firstNameAm}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="የመጀመሪያ ስም"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Middle Name (Amharic)
                </label>
                <input
                  type="text"
                  name="middleNameAm"
                  value={formData.middleNameAm}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="የአባት ስም"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name (Amharic)
                </label>
                <input
                  type="text"
                  name="lastNameAm"
                  value={formData.lastNameAm}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="የአያት ስም"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Code
                </label>
                <input
                  type="text"
                  name="paymentCode"
                  value={formData.paymentCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter payment code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
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
                  type="text"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange}
                  className="input-field"
                  placeholder="dd/mm/yyyy"
                  maxLength="10"
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
                    if (!/[0-9/]/.test(e.key)) e.preventDefault();
                  }}
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
                  Section (Optional)
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Section (Optional)</option>
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
              <span>{isEdit ? 'Update Special Student' : 'Save Special Student'}</span>
            </button>
            <Link 
              to="/special-students" 
              className="btn-secondary"
              onClick={() => setIsEditing(false)}
            >
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
        actionText="View Special Students"
      />
    </div>
  );
};

export default AddSpecialStudent;