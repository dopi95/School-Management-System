import React, { useState } from 'react';
import { Save, CheckCircle, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/lolo.jpg';

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    firstNameAm: '',
    middleNameAm: '',
    lastNameAm: '',
    gender: '',
    email: '',
    dateOfBirth: '',
    joinedYear: '',
    address: '',
    class: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    photo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});


  const classes = ['KG-1', 'KG-2', 'KG-3'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, dateOfBirth: e.target.value });
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

  
    const validateForm = () => {
    const newErrors = {};

  // Required fields
  const requiredFields = {
    firstName: 'First Name',
    middleName: 'Middle Name (Father Name)',
    lastName: 'Last Name',
    firstNameAm: 'First Name (Amharic)',
    middleNameAm: 'Middle Name (Amharic)',
    lastNameAm: 'Last Name (Amharic)',
    gender: 'Gender',
    dateOfBirth: 'Date of Birth',
    joinedYear: 'Joined Year',
    address: 'Address',
    class: 'Class',
    fatherName: 'Father Name',
    fatherPhone: 'Father Phone',
    motherName: 'Mother Name',
    motherPhone: 'Mother Phone'
  };

  // Step 1: Required fields
  for (const [field, label] of Object.entries(requiredFields)) {
    if (!formData[field] || formData[field].trim() === '') {
      newErrors[field] = `${label} is required`;
    }
  }

  // Step 2: Date format (dd/mm/yyyy)
  const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
  if (formData.dateOfBirth && !dateRegex.test(formData.dateOfBirth)) {
    newErrors.dateOfBirth = 'Use valid format: dd/mm/yyyy';
  }

  // Step 3: Joined Year (4 digits)
  const yearRegex = /^\d{4}$/;
  if (formData.joinedYear && !yearRegex.test(formData.joinedYear)) {
    newErrors.joinedYear = 'Use 4-digit year only';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
const validateField = (name, value) => {
  let error = '';

  // Date of Birth
  if (name === 'dateOfBirth') {
    const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
    if (!value.trim()) {
      error = 'Date of Birth is required';
    } else if (!dateRegex.test(value)) {
      error = 'Use valid format: dd/mm/yyyy';
    }
  }

  // Joined Year
  if (name === 'joinedYear') {
    const yearRegex = /^\d{4}$/;
    if (!value.trim()) {
      error = 'Joined Year is required';
    } else if (!yearRegex.test(value)) {
      error = 'Use 4-digit year only';
    }
  }

  // Father Phone
  if (name === 'fatherPhone') {
    const phoneRegex = /^(09|07)\d{8}$/;
    if (!value.trim()) {
      error = 'Father Phone is required';
    } else if (!phoneRegex.test(value)) {
      error = 'Use valid format: starts with 09 or 07 and 10 digits total';
    }
  }

  // Mother Phone
  if (name === 'motherPhone') {
    const phoneRegex = /^(09|07)\d{8}$/;
    if (!value.trim()) {
      error = 'Mother Phone is required';
    } else if (!phoneRegex.test(value)) {
      error = 'Use valid format: starts with 09 or 07 and 10 digits total';
    }
  }

  setErrors(prev => ({ ...prev, [name]: error }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pending-students/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      setIsSubmitted(true);
      toast.success('Registration submitted successfully! We will review your application.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error(`Registration failed: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration Submitted!</h2>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ምዝገባው ተሳክቷል!</h2>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                firstName: '', middleName: '', lastName: '', firstNameAm: '', middleNameAm: '', lastNameAm: '',
                gender: '', email: '', dateOfBirth: '', joinedYear: '', address: '', class: '',
                fatherName: '', fatherPhone: '', motherName: '', motherPhone: '', photo: ''
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Submit Another Registration
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-500 text-white p-4 lg:p-8">
            <div className="flex flex-col items-center space-y-4">
              {/* Logo */}
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img src={logo} alt="Bluelight Academy Logo" className="w-full h-full object-cover" />
              </div>
              
              {/* School Names */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl lg:text-4xl font-bold tracking-wide">Bluelight Academy</h1>
                <h2 className="text-xl lg:text-3xl font-bold tracking-wide">ብሉላይት አካዳሚ</h2>
                <div className="w-24 lg:w-32 h-1 bg-white mx-auto rounded-full opacity-80"></div>
              </div>
              
              {/* Subtitle */}
              <div className="text-center">
                <p className="text-white text-base lg:text-lg font-medium">Student Registration Form</p>
                <p className="text-white text-sm lg:text-base">የተማሪ ምዝገባ ቅጽ</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Student Information</h3>
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">የተማሪው መረጃ</h3>

              
              {/* Photo Upload */}
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">4x4 Photo</div>
                      <div className="text-gray-400 text-xs">(Optional)</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Photo (4x4) - Optional
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                  />
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: '' })}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name (Father Name) *
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name (Grand Father Name) *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student First Name (Amharic) *
                  </label>
                  <input
                    type="text"
                    name="firstNameAm"
                    value={formData.firstNameAm}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="የተማሪው/ዋ ስም"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name (Amharic) *
                  </label>
                  <input
                    type="text"
                    name="middleNameAm"
                    value={formData.middleNameAm}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="የአባት ስም"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name (Amharic) *
                  </label>
                  <input
                    type="text"
                    name="lastNameAm"
                    value={formData.lastNameAm}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="የአያት ስም"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender(ፆታ) *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                       <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Date of Birth (የትውልድ ቀን) *
  </label>
  <input
    type="text"
    name="dateOfBirth"
    value={formData.dateOfBirth}
    onChange={(e) => {
      handleDateChange(e);
      if (errors.dateOfBirth) validateField('dateOfBirth', e.target.value);
    }}
    onBlur={(e) => validateField('dateOfBirth', e.target.value)}
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
    }`}
    placeholder="dd/mm/yyyy E.C"
    required
  />
  {errors.dateOfBirth && (
    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
  )}
</div>



              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Joined Year (የገባበት/ችበት) *
  </label>
  <input
    type="text"
    name="joinedYear"
    value={formData.joinedYear}
    onChange={(e) => {
      handleChange(e);
      if (errors.joinedYear) validateField('joinedYear', e.target.value);
    }}
    onBlur={(e) => validateField('joinedYear', e.target.value)}
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors.joinedYear ? 'border-red-500' : 'border-gray-300'
    }`}
    placeholder="e.g. 2018 E.C"
    required
  />
  {errors.joinedYear && (
    <p className="text-red-500 text-sm mt-1">{errors.joinedYear}</p>
  )}
</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class (ክፍል) *
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Parent Information</h3>
               <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">የወላጅ መረጃ</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father Full Name *
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Father Phone (የአባት ስልክ) *
  </label>
  <input
    type="text"
    name="fatherPhone"
    value={formData.fatherPhone}
    onChange={(e) => {
      handleChange(e);
      if (errors.fatherPhone) validateField('fatherPhone', e.target.value);
    }}
    onBlur={(e) => validateField('fatherPhone', e.target.value)}
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors.fatherPhone ? 'border-red-500' : 'border-gray-300'
    }`}
    placeholder="e.g. 0912345678"
    required
  />
  {errors.fatherPhone && (
    <p className="text-red-500 text-sm mt-1">{errors.fatherPhone}</p>
  )}
</div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother Full Name *
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Mother Phone (የእናት ስልክ) *
  </label>
  <input
    type="text"
    name="motherPhone"
    value={formData.motherPhone}
    onChange={(e) => {
      handleChange(e);
      if (errors.motherPhone) validateField('motherPhone', e.target.value);
    }}
    onBlur={(e) => validateField('motherPhone', e.target.value)}
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors.motherPhone ? 'border-red-500' : 'border-gray-300'
    }`}
    placeholder="e.g. 0912345678"
    required
  />
  {errors.motherPhone && (
    <p className="text-red-500 text-sm mt-1">{errors.motherPhone}</p>
  )}
</div>

              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-500 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Registration'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default StudentRegistration;