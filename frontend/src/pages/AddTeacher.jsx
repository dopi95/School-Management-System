import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useEmployees } from '../context/EmployeesContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

const AddTeacher = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const { employeesList, setEmployeesList } = useEmployees();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    classes: [],
    qualification: '',
    experience: '',
    address: ''
  });
  
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const roles = ['Teacher', 'Assistant', 'Principal', 'Secretary', 'Janitor', 'Security'];
  const availableClasses = ['KG-1', 'KG-2', 'KG-3'];

  useEffect(() => {
    if (isEdit && id) {
      const employee = employeesList.find(e => e.id === id);
      if (employee) {
        setFormData({
          name: employee.name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          role: employee.role || '',
          classes: employee.classes || [],
          qualification: employee.qualification || '',
          experience: employee.experience || '',
          address: employee.address || ''
        });
      }
    }
  }, [isEdit, id, employeesList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role' && value !== 'Teacher') {
      setFormData({ ...formData, [name]: value, classes: [] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleClassChange = (className) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter(c => c !== className)
        : [...prev.classes, className]
    }));
  };

  const generateId = () => {
    const existingIds = employeesList.map(e => parseInt(e.id.replace('E', '')));
    const maxId = Math.max(...existingIds, 0);
    return `E${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const employeeData = {
      ...formData,
      status: 'active'
    };

    if (isEdit) {
      setEmployeesList(prev => prev.map(employee => 
        employee.id === id ? { ...employee, ...employeeData } : employee
      ));
      setSuccessModal({
        isOpen: true,
        title: 'Employee Updated!',
        message: `${formData.name || 'Employee'} has been successfully updated.`
      });
    } else {
      const newEmployee = {
        id: generateId(),
        ...employeeData
      };
      setEmployeesList(prev => [...prev, newEmployee]);
      setSuccessModal({
        isOpen: true,
        title: 'Employee Added!',
        message: `${formData.name || 'New employee'} has been successfully added to the system.`
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
    navigate('/teachers');
  };

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

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee Name
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
                    {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
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
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="input-field"
                  />
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

            {/* Classes Teaching - Only for Teachers */}
            {formData.role === 'Teacher' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Classes Teaching</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select the classes this teacher will teach:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {availableClasses.map(className => (
                      <label key={className} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.classes.includes(className)}
                          onChange={() => handleClassChange(className)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{className}</span>
                      </label>
                    ))}
                  </div>
                  {formData.classes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selected classes:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.classes.map(className => (
                          <span key={className} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {className}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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