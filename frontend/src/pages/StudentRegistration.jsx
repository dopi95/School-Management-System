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
    joinedYear: '2018',
    address: '',
    class: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    photo: '',
    studentType: 'new'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const classes = ['KG-1', 'KG-2', 'KG-3'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If student type is changed, set or clear joined year
    if (name === 'studentType') {
      const joinedYear = value === 'new' ? '2018' : '';
      setFormData({ ...formData, [name]: value, joinedYear });
      return;
    }
    
    // Filter input based on field type
    let filteredValue = value;
    const newErrors = { ...fieldErrors };
    
    // English name fields - only allow English letters and spaces
    if (['firstName', 'middleName', 'lastName'].includes(name)) {
      const originalLength = value.length;
      filteredValue = value.replace(/[^A-Za-z\s]/g, '');
      if (filteredValue.length < originalLength) {
        newErrors[name] = 'Please write in English only';
        setTouchedFields({ ...touchedFields, [name]: true });
      } else {
        delete newErrors[name];
      }
    }
    
    // Amharic name fields - only allow Amharic letters and spaces
    if (['firstNameAm', 'middleNameAm', 'lastNameAm'].includes(name)) {
      const originalLength = value.length;
      filteredValue = value.replace(/[^\u1200-\u137F\s]/g, '');
      if (filteredValue.length < originalLength) {
        newErrors[name] = 'እባክዎ በአማርኛ ይፃፍ';
        setTouchedFields({ ...touchedFields, [name]: true });
      } else {
        delete newErrors[name];
      }
    }
    
    // Joined Year field - only allow 4-digit numbers between 2017-2019
    if (name === 'joinedYear') {
      // Only allow numbers
      filteredValue = value.replace(/[^0-9]/g, '');
      
      // Limit to 4 digits
      if (filteredValue.length > 4) {
        filteredValue = filteredValue.slice(0, 4);
      }
      
      // Validate year range if 4 digits entered
      if (filteredValue.length === 4) {
        const year = parseInt(filteredValue);
        if (year < 2017 || year > 2019) {
          newErrors[name] = 'Year must be between 2017-2019';
          setTouchedFields({ ...touchedFields, [name]: true });
        } else {
          delete newErrors[name];
        }
      } else if (filteredValue.length > 0) {
        newErrors[name] = 'Please enter 4-digit year';
        setTouchedFields({ ...touchedFields, [name]: true });
      } else {
        delete newErrors[name];
      }
    }
    
    // Parent name fields - only allow English letters and spaces
    if (['fatherName', 'motherName'].includes(name)) {
      const originalLength = value.length;
      filteredValue = value.replace(/[^A-Za-z\s]/g, '');
      if (filteredValue.length < originalLength) {
        newErrors[name] = 'Please write in English only';
        setTouchedFields({ ...touchedFields, [name]: true });
      } else {
        // Check if full name contains at least two words
        const words = filteredValue.trim().split(/\s+/).filter(word => word.length > 0);
        if (filteredValue.trim() && words.length < 2) {
          newErrors[name] = 'ሙሉ ስም ከነ አባት ስም ያስገቡ';
          setTouchedFields({ ...touchedFields, [name]: true });
        } else {
          delete newErrors[name];
        }
      }
    }
    
    // Phone number fields - Ethiopian format (09xxxxxxxx or 07xxxxxxxx)
    if (['fatherPhone', 'motherPhone'].includes(name)) {
      // Only allow numbers
      filteredValue = value.replace(/[^0-9]/g, '');
      
      // Limit to 10 digits
      if (filteredValue.length > 10) {
        filteredValue = filteredValue.slice(0, 10);
      }
      
      // Validate Ethiopian phone format
      if (filteredValue.length > 0) {
        if (filteredValue.length < 10) {
          newErrors[name] = 'Phone must be 10 digits';
          setTouchedFields({ ...touchedFields, [name]: true });
        } else if (!filteredValue.startsWith('09') && !filteredValue.startsWith('07')) {
          newErrors[name] = 'Phone must start with 09 or 07';
          setTouchedFields({ ...touchedFields, [name]: true });
        } else {
          delete newErrors[name];
        }
      } else {
        delete newErrors[name];
      }
    }
    
    // Address field - no special filtering, just clear errors when typing
    if (name === 'address') {
      filteredValue = value;
      delete newErrors[name];
    }
    
    setFormData({ ...formData, [name]: filteredValue });
    
    // Check if previous required fields are filled when typing
    const fieldOrder = Object.keys(requiredFields);
    const currentIndex = fieldOrder.indexOf(name);
    
    // Check previous fields and show error on first empty one (only if no language error)
    if (!newErrors[name]) {
      for (let i = 0; i < currentIndex; i++) {
        const prevField = fieldOrder[i];
        if (!formData[prevField] || formData[prevField].trim() === '') {
          newErrors[prevField] = 'Fill this first';
          setTouchedFields({ ...touchedFields, [prevField]: true });
          break;
        }
      }
    }
    
    setFieldErrors(newErrors);
  };

  const handleDateChange = (e) => {
    let value = e.target.value;
    
    // Only allow numbers and forward slashes
    value = value.replace(/[^0-9/]/g, '');
    
    // Format as dd/mm/yyyy
    if (value.length <= 10) {
      if (value.length === 2 && !value.includes('/')) {
        value = value + '/';
      } else if (value.length === 5 && value.split('/').length === 2) {
        value = value + '/';
      }
    }
    
    setFormData({ ...formData, dateOfBirth: value });
    
    // Validate Ethiopian calendar date format
    const newErrors = { ...fieldErrors };
    const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    
    if (value && datePattern.test(value)) {
      const [day, month, year] = value.split('/').map(Number);
      if (day < 1 || day > 30) {
        newErrors.dateOfBirth = 'Day must be between 1-30';
        setTouchedFields({ ...touchedFields, dateOfBirth: true });
      } else if (month < 1 || month > 13) {
        newErrors.dateOfBirth = 'Month must be between 1-13 (Ethiopian calendar)';
        setTouchedFields({ ...touchedFields, dateOfBirth: true });
      } else {
        delete newErrors.dateOfBirth;
      }
    } else if (value && !datePattern.test(value)) {
      newErrors.dateOfBirth = 'Please enter date as dd/mm/yyyy';
      setTouchedFields({ ...touchedFields, dateOfBirth: true });
    } else {
      delete newErrors.dateOfBirth;
    }
    
    // Check if previous required fields are filled when typing
    const fieldOrder = Object.keys(requiredFields);
    const currentIndex = fieldOrder.indexOf('dateOfBirth');
    
    // Check previous fields and show error on first empty one
    if (!newErrors.dateOfBirth) {
      for (let i = 0; i < currentIndex; i++) {
        const prevField = fieldOrder[i];
        if (!formData[prevField] || formData[prevField].trim() === '') {
          newErrors[prevField] = 'Fill this first';
          setTouchedFields({ ...touchedFields, [prevField]: true });
          break;
        }
      }
    }
    
    setFieldErrors(newErrors);
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

  const requiredFields = {
    studentType: 'Student Type',
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

  const validateField = (fieldName, value) => {
    if (requiredFields[fieldName] && (!value || value.trim() === '')) {
      return `${requiredFields[fieldName]} is required`;
    }
    return '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields({ ...touchedFields, [name]: true });
    
    const error = validateField(name, value);
    if (error) {
      setFieldErrors({ ...fieldErrors, [name]: error });
    }
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    const fieldOrder = Object.keys(requiredFields);
    const currentIndex = fieldOrder.indexOf(name);
    
    // Check if previous required fields are filled
    for (let i = 0; i < currentIndex; i++) {
      const prevField = fieldOrder[i];
      if (!formData[prevField] || formData[prevField].trim() === '') {
        const error = `Fill this first`;
        setFieldErrors({ ...fieldErrors, [prevField]: error });
        setTouchedFields({ ...touchedFields, [prevField]: true });
        return;
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    let hasErrors = false;

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${label} is required`;
        hasErrors = true;
      }
    }

    setFieldErrors(errors);
    setTouchedFields(Object.keys(requiredFields).reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    // Errors will be shown via field validation messages

    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Process name fields to only include text before first space
      const processedData = {
        ...formData,
        firstName: formData.firstName.split(' ')[0],
        middleName: formData.middleName.split(' ')[0],
        lastName: formData.lastName.split(' ')[0],
        firstNameAm: formData.firstNameAm.split(' ')[0],
        middleNameAm: formData.middleNameAm.split(' ')[0],
        lastNameAm: formData.lastNameAm.split(' ')[0]
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pending-students/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration Submitted!<br/>ምዝገባው ተሳክቷል</h2>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                firstName: '', middleName: '', lastName: '', firstNameAm: '', middleNameAm: '', lastNameAm: '',
                gender: '', email: '', dateOfBirth: '', joinedYear: '2018', address: '', class: '',
                fatherName: '', fatherPhone: '', motherName: '', motherPhone: '', photo: '', studentType: 'new'
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
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Student Information (የተማሪው መረጃ)</h3>
              
              {/* Photo Upload */}
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Photo (የተማሪው ፎቶ) - Optional
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
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Type (የተማሪ አይነት) *
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="studentType"
                      value="new"
                      checked={formData.studentType === 'new'}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-700">New (አዲስ)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="studentType"
                      value="existing"
                      checked={formData.studentType === 'existing'}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-700">Existing (ነባር)</span>
                  </label>
                </div>
                {fieldErrors.studentType && touchedFields.studentType && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.studentType}</p>
                )}
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
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.firstName && touchedFields.firstName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.firstName && touchedFields.firstName && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>
                  )}
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
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.middleName && touchedFields.middleName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.middleName && touchedFields.middleName && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.middleName}</p>
                  )}
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
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.lastName && touchedFields.lastName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.lastName && touchedFields.lastName && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    የተማሪው የመጀመሪያ ስም *
                  </label>
                  <input
                    type="text"
                    name="firstNameAm"
                    value={formData.firstNameAm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.firstNameAm && touchedFields.firstNameAm
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.firstNameAm && touchedFields.firstNameAm && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.firstNameAm}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    የአባት ስም *
                  </label>
                  <input
                    type="text"
                    name="middleNameAm"
                    value={formData.middleNameAm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.middleNameAm && touchedFields.middleNameAm
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.middleNameAm && touchedFields.middleNameAm && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.middleNameAm}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    የአያት ስም *
                  </label>
                  <input
                    type="text"
                    name="lastNameAm"
                    value={formData.lastNameAm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.lastNameAm && touchedFields.lastNameAm
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.lastNameAm && touchedFields.lastNameAm && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.lastNameAm}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender (ፆታ) *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.gender && touchedFields.gender
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male (ወንድ)</option>
                    <option value="female">Female (ሴት)</option>
                  </select>
                  {fieldErrors.gender && touchedFields.gender && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.gender}</p>
                  )}
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
                    Date of Birth (የተወለዱበት ቀን) *
                  </label>
                  <input
                    type="text"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleDateChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.dateOfBirth && touchedFields.dateOfBirth
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="dd/mm/yyyy E.C"
                    required
                  />
                  {fieldErrors.dateOfBirth && touchedFields.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joined Year (ትምሕርት የጀመሩበት/የሚጀምሩበት ዓመት) *
                  </label>
                  <input
                    type="text"
                    name="joinedYear"
                    value={formData.joinedYear}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.joinedYear && touchedFields.joinedYear
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="yyyy E.C"
                    required
                  />
                  {fieldErrors.joinedYear && touchedFields.joinedYear && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.joinedYear}</p>
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
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.class && touchedFields.class
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="KG-1">KG-1 (ጀማሪ)</option>
                    <option value="KG-2">KG-2 (ደረጃ 1)</option>
                    <option value="KG-3">KG-3 (ደረጃ 2)</option>
                  </select>
                  {fieldErrors.class && touchedFields.class && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.class}</p>
                  )}
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
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.address && touchedFields.address
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.address && touchedFields.address && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Parent Information (የወላጅ መረጃ)</h3>
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
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.fatherName && touchedFields.fatherName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.fatherName && touchedFields.fatherName && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.fatherName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father Phone *
                  </label>
                  <input
                    type="tel"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.fatherPhone && touchedFields.fatherPhone
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.fatherPhone && touchedFields.fatherPhone && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.fatherPhone}</p>
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
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.motherName && touchedFields.motherName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.motherName && touchedFields.motherName && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.motherName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother Phone *
                  </label>
                  <input
                    type="tel"
                    name="motherPhone"
                    value={formData.motherPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.motherPhone && touchedFields.motherPhone
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    required
                  />
                  {fieldErrors.motherPhone && touchedFields.motherPhone && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.motherPhone}</p>
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