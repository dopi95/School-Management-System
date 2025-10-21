import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, DollarSign, Plus, X } from 'lucide-react';
import { useEmployees } from '../context/EmployeesContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employeesList, loading, addEmployeeSalary, updateEmployeeSalary } = useEmployees();
  const [employee, setEmployee] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ year: '', monthlySalary: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    if (!loading && employeesList.length > 0) {
      const emp = employeesList.find(e => e.id === id);
      if (emp) {
        setEmployee(emp);
      } else {
        navigate('/teachers');
      }
    }
  }, [id, employeesList, loading, navigate]);

  const generateYearOptions = () => {
    const years = [];
    for (let year = 2017; year <= 2050; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const getSalaryForYear = (year) => {
    if (!employee?.salaryByYear) return null;
    return employee.salaryByYear.find(s => s.year === year);
  };

  const handleAddSalary = async () => {
    if (!salaryForm.year || !salaryForm.monthlySalary) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const updatedEmployee = await addEmployeeSalary(id, salaryForm.year, Number(salaryForm.monthlySalary));
      setEmployee(updatedEmployee);
      setShowSalaryModal(false);
      setSalaryForm({ year: '', monthlySalary: '' });
      setSuccessModal({
        isOpen: true,
        title: 'Salary Added!',
        message: `Salary for ${salaryForm.year} has been added successfully.`
      });
    } catch (error) {
      alert('Error adding salary: ' + error.message);
    }
  };

  const handleUpdateSalary = async () => {
    if (!salaryForm.year || !salaryForm.monthlySalary) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const updatedEmployee = await updateEmployeeSalary(id, salaryForm.year, Number(salaryForm.monthlySalary));
      setEmployee(updatedEmployee);
      setShowSalaryModal(false);
      setSalaryForm({ year: '', monthlySalary: '' });
      setSuccessModal({
        isOpen: true,
        title: 'Salary Updated!',
        message: `Salary for ${salaryForm.year} has been updated successfully.`
      });
    } catch (error) {
      alert('Error updating salary: ' + error.message);
    }
  };

  const openSalaryModal = (year = '', salary = '') => {
    setSalaryForm({ year, monthlySalary: salary });
    setShowSalaryModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Employee Not Found</h2>
          <Link to="/teachers" className="btn-primary">Back to Employees</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 px-2 lg:px-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/teachers" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
        <Link
          to={`/teachers/edit/${employee.id}`}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span className="hidden lg:inline">Edit Employee</span>
          <span className="lg:hidden">Edit</span>
        </Link>
      </div>
      <div className="-mt-2">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">
          {employee.fullName || employee.name}
        </h1>
        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Employee ID: {employee.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Basic Information */}
        <div className="card">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">Basic Information</h3>
          {employee.photo && (
            <div className="mb-3 lg:mb-4 flex justify-center lg:justify-start">
              <img src={employee.photo} alt="Employee" className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-lg border" />
            </div>
          )}
          <div className="space-y-2 lg:space-y-3">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Full Name:</span>
              <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white break-words">{employee.fullName || employee.name}</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Phone:</span>
              <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{employee.phone}</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Role:</span>
              <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{employee.role || employee.position}</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Sex:</span>
              <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{employee.sex || 'N/A'}</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Employment Date:</span>
              <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">
                {employee.employmentDate || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Employment Type:</span>
              <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">
                {employee.employmentType === 'fulltime' ? 'Full Time' : employee.employmentType === 'parttime' ? 'Part Time' : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Qualification:</span>
              <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white break-words">{employee.qualificationLevel || employee.qualification || 'N/A'}</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Experience:</span>
              <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{employee.experience || 'N/A'}</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Address:</span>
              <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white break-words">{employee.address || 'N/A'}</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
              <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 lg:mt-0 w-fit ${
                employee.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {employee.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Teaching Information */}
        {employee.role === 'Teacher' && (
          <div className="card">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">Teaching Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400 block mb-2">Teaching Subjects:</span>
                {employee.teachingSubjects && employee.teachingSubjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1 lg:gap-2">
                    {employee.teachingSubjects.map((subject, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No subjects assigned</span>
                )}
              </div>
              <div>
                <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400 block mb-2">Teaching Grade Level:</span>
                {(employee.teachingGradeLevel || employee.classes) && (employee.teachingGradeLevel || employee.classes).length > 0 ? (
                  <div className="flex flex-wrap gap-1 lg:gap-2">
                    {(employee.teachingGradeLevel || employee.classes).map((grade, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {grade}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No grades assigned</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Salary Information */}
      <div className="card">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-3 lg:mb-4">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Salary Information</h3>
          <button
            onClick={() => openSalaryModal()}
            className="btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Salary</span>
          </button>
        </div>

        <div className="mb-3 lg:mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Year to View Salary:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-field w-full lg:max-w-xs"
          >
            <option value="">Select Year</option>
            {generateYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {selectedYear && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 lg:p-4 rounded-lg">
            {getSalaryForYear(selectedYear) ? (
              <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <h4 className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Salary for {selectedYear}</h4>
                  <p className="text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                    {getSalaryForYear(selectedYear).monthlySalary} Birr/month
                  </p>
                </div>
                <button
                  onClick={() => openSalaryModal(selectedYear, getSalaryForYear(selectedYear).monthlySalary)}
                  className="btn-secondary flex items-center justify-center space-x-2 w-full lg:w-auto"
                >
                  <Edit className="w-4 h-4" />
                  <span>Update</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-6 lg:py-8">
                <DollarSign className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-3 lg:mb-4">No salary record for {selectedYear}</p>
                <button
                  onClick={() => openSalaryModal(selectedYear)}
                  className="btn-primary w-full lg:w-auto"
                >
                  Add Salary for {selectedYear}
                </button>
              </div>
            )}
          </div>
        )}

        {employee.salaryByYear && employee.salaryByYear.length > 0 && (
          <div className="mt-4 lg:mt-6">
            <h4 className="text-sm lg:text-base font-medium text-gray-900 dark:text-white mb-3">All Salary Records</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
              {employee.salaryByYear.map((salary, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{salary.year}</p>
                      <p className="text-base lg:text-lg font-bold text-green-600 dark:text-green-400">{salary.monthlySalary} Birr/month</p>
                    </div>
                    <button
                      onClick={() => openSalaryModal(salary.year, salary.monthlySalary)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Salary Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                {getSalaryForYear(salaryForm.year) ? 'Update Salary' : 'Add Salary'}
              </h3>
              <button
                onClick={() => setShowSalaryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={salaryForm.year}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, year: e.target.value }))}
                  className="input-field w-full"
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
                  value={salaryForm.monthlySalary}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, monthlySalary: e.target.value }))}
                  placeholder="Enter monthly salary"
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-3 mt-6">
              <button
                onClick={getSalaryForYear(salaryForm.year) ? handleUpdateSalary : handleAddSalary}
                disabled={!salaryForm.year || !salaryForm.monthlySalary}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {getSalaryForYear(salaryForm.year) ? 'Update Salary' : 'Add Salary'}
              </button>
              <button
                onClick={() => setShowSalaryModal(false)}
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

export default EmployeeDetail;