import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useEmployees } from '../context/EmployeesContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

const AddTeacher = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const { employeesList, loading, addEmployee, updateEmployee } = useEmployees();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    role: '',
    qualificationLevel: '',
    experience: '',
    address: '',
    sex: '',
    employmentDate: '',
    employmentType: '',
    teachingSubjects: [],
    teachingGradeLevel: [],
    salaryByYear: [],
    photo: ''
  });
  
  const [currentSalary, setCurrentSalary] = useState({ year: '', monthlySalary: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const roles = ['Teacher', 'Assistant', 'Principal', 'Director', 'Secretary', 'ICT Expert', 'Janitor', 'Security'];
  const availableGrades = ['KG-1', 'KG-2', 'KG-3'];
  const subjects = ['Amharic', 'English', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education'];

  useEffect(() => {
    if (isEdit && id && !loading && employeesList.length > 0) {
      const employee = employeesList.find(e => e.id === id);
      if (employee) {
        setFormData({
          fullName: employee.fullName || employee.name || '',
          phone: employee.phone || '',
          role: employee.role || employee.position || '',
          qualificationLevel: employee.qualificationLevel || employee.qualification || '',
          experience: employee.experience || '',
          address: employee.address || '',
          sex: employee.sex || '',
          employmentDate: employee.employmentDate || '',
          employmentType: employee.employmentType || '',
          teachingSubjects: employee.teachingSubjects || [],
          teachingGradeLevel: employee.teachingGradeLevel || employee.classes || [],
          salaryByYear: employee.salaryByYear || [],
          photo: employee.photo || ''
        });
      }
    }
  }, [isEdit, id, employeesList, loading]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2017; year <= 2050; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role' && value !== 'Teacher') {
      setFormData({ ...formData, [name]: value, teachingSubjects: [], teachingGradeLevel: [] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubjectAdd = (subject) => {
    if (!formData.teachingSubjects.includes(subject)) {
      setFormData(prev => ({
        ...prev,
        teachingSubjects: [...prev.teachingSubjects, subject]
      }));
    }
  };

  const handleSubjectRemove = (subject) => {
    setFormData(prev => ({
      ...prev,
      teachingSubjects: prev.teachingSubjects.filter(s => s !== subject)
    }));
  };

  const handleGradeChange = (grade) => {
    setFormData(prev => ({
      ...prev,
      teachingGradeLevel: prev.teachingGradeLevel.includes(grade)
        ? prev.teachingGradeLevel.filter(g => g !== grade)
        : [...prev.teachingGradeLevel, grade]
    }));
  };

  const handleSalaryAdd = () => {
    if (currentSalary.year && currentSalary.monthlySalary) {
      const existingSalary = formData.salaryByYear.find(s => s.year === currentSalary.year);
      if (existingSalary) {
        alert('Salary for this year already exists!');
        return;
      }
      setFormData(prev => ({
        ...prev,
        salaryByYear: [...prev.salaryByYear, { ...currentSalary, monthlySalary: Number(currentSalary.monthlySalary) }]
      }));
      setCurrentSalary({ year: '', monthlySalary: '' });
    }
  };

  const handleSalaryRemove = (year) => {
    setFormData(prev => ({
      ...prev,
      salaryByYear: prev.salaryByYear.filter(s => s.year !== year)
    }));
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
    
    setFormData({ ...formData, employmentDate: formatted });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.role || !formData.sex || !formData.employmentDate || !formData.employmentType) {
      alert('Please fill in all required fields');
      return;
    }

    const employeeData = {
      ...formData,
      status: 'active',
      // Backward compatibility
      name: formData.fullName,
      position: formData.role,
      qualification: formData.qualificationLevel,
      classes: formData.teachingGradeLevel
    };

    try {
      if (isEdit) {
        await updateEmployee(id, employeeData);
        setSuccessModal({
          isOpen: true,
          title: 'Employee Updated!',
          message: `${formData.fullName} has been successfully updated.`
        });
      } else {
        await addEmployee(employeeData);
        setSuccessModal({
          isOpen: true,
          title: 'Employee Added!',
          message: `${formData.fullName} has been successfully added to the system.`
        });
      }
    } catch (error) {
      alert('Error: ' + error.message);
      return;
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
    navigate('/teachers');
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
        <Link to="/teachers" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEdit ? 'Update employee information' : 'Add new employee to the system'}
          </p>
        </div>
      </div>

      <div className="card max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Information</h3>
              
              {/* Photo Upload */}
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Employee" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">4x4 Photo</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee Photo (4x4)
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
                      onClick={() => setFormData({ ...formData, photo: '' })}
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
                    Employee ID <span className="text-gray-500">(Auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    value={isEdit ? id : 'BLSTA###'}
                    disabled
                    className="input-field bg-gray-100 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Qualification Level
                  </label>
                  <input
                    type="text"
                    name="qualificationLevel"
                    value={formData.qualificationLevel}
                    onChange={handleChange}
                    placeholder="e.g., Bachelor's Degree, Master's Degree"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 5 years"
                    className="input-field"
                  />
                </div>

                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sex *
                  </label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employment Date *
                  </label>
                  <input
                    type="text"
                    name="employmentDate"
                    value={formData.employmentDate}
                    onChange={handleDateChange}
                    className="input-field"
                    placeholder="dd/mm/yyyy"
                    maxLength="10"
                    required
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') return;
                      if (!/[0-9/]/.test(e.key)) e.preventDefault();
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employment Type *
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Employment Type</option>
                    <option value="fulltime">Full Time</option>
                    <option value="parttime">Part Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Teaching Information - Only for Teachers */}
            {formData.role === 'Teacher' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Teaching Information</h3>
                
                {/* Teaching Subjects */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Teaching Subjects
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {subjects.map(subject => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectAdd(subject)}
                        disabled={formData.teachingSubjects.includes(subject)}
                        className={`px-3 py-1 text-sm rounded-full border ${
                          formData.teachingSubjects.includes(subject)
                            ? 'bg-blue-100 text-blue-800 border-blue-300 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {subject} {formData.teachingSubjects.includes(subject) ? '✓' : '+'}
                      </button>
                    ))}
                  </div>
                  {formData.teachingSubjects.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Selected subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.teachingSubjects.map(subject => (
                          <span key={subject} className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {subject}
                            <button
                              type="button"
                              onClick={() => handleSubjectRemove(subject)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Teaching Grade Level */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Teaching Grade Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableGrades.map(grade => (
                      <label key={grade} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.teachingGradeLevel.includes(grade)}
                          onChange={() => handleGradeChange(grade)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{grade}</span>
                      </label>
                    ))}
                  </div>
                  {formData.teachingGradeLevel.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selected grades:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.teachingGradeLevel.map(grade => (
                          <span key={grade} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {grade}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Salary Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Salary Information</h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year
                    </label>
                    <select
                      value={currentSalary.year}
                      onChange={(e) => setCurrentSalary(prev => ({ ...prev, year: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select Year</option>
                      {generateYearOptions().map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Salary
                    </label>
                    <input
                      type="number"
                      value={currentSalary.monthlySalary}
                      onChange={(e) => setCurrentSalary(prev => ({ ...prev, monthlySalary: e.target.value }))}
                      placeholder="Enter monthly salary"
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleSalaryAdd}
                      disabled={!currentSalary.year || !currentSalary.monthlySalary}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Salary</span>
                    </button>
                  </div>
                </div>

                {formData.salaryByYear.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Added Salaries:</p>
                    <div className="space-y-2">
                      {formData.salaryByYear.map((salary, index) => (
                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded border">
                          <div>
                            <span className="font-medium">{salary.year}</span>
                            <span className="text-gray-500 ml-2">- {salary.monthlySalary} Birr/month</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSalaryRemove(salary.year)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>{isEdit ? 'Update Employee' : 'Save Employee'}</span>
            </button>
            <Link to="/teachers" className="btn-secondary">
              {t('cancel')}
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
        actionText="View Employees"
      />
    </div>
  );
};

export default AddTeacher;