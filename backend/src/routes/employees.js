import express from 'express';
import Employee from '../models/Employee.js';
import { logActivity } from '../utils/activityLogger.js';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ id: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    if (!req.body.id) {
      const lastEmployee = await Employee.findOne({ id: /^BLSTA\d+$/ }).sort({ id: -1 });
      let nextNumber = 1;
      if (lastEmployee) {
        const lastNumber = parseInt(lastEmployee.id.replace('BLSTA', ''));
        nextNumber = lastNumber + 1;
      }
      req.body.id = `BLSTA${String(nextNumber).padStart(3, '0')}`;
    }

    const existingEmployee = await Employee.findOne({ id: req.body.id });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();
    await logActivity(req, 'EMPLOYEE_CREATE', 'Employee', savedEmployee.id, savedEmployee.fullName || savedEmployee.name, `Employee created: ${savedEmployee.fullName || savedEmployee.name}`);
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    await logActivity(req, 'EMPLOYEE_UPDATE', 'Employee', employee.id, employee.fullName || employee.name, `Employee updated: ${employee.fullName || employee.name}`);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add salary for a specific year
router.post('/:id/salary', async (req, res) => {
  try {
    const { year, monthlySalary } = req.body;
    const employee = await Employee.findOne({ id: req.params.id });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if salary for this year already exists
    const existingSalary = employee.salaryByYear.find(s => s.year === year);
    if (existingSalary) {
      return res.status(400).json({ message: 'Salary for this year already exists' });
    }

    employee.salaryByYear.push({ year, monthlySalary });
    await employee.save();
    
    await logActivity(req, 'EMPLOYEE_SALARY_ADD', 'Employee', employee.id, employee.fullName || employee.name, `Salary added for year ${year}: ${employee.fullName || employee.name}`);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update salary for a specific year
router.put('/:id/salary/:year', async (req, res) => {
  try {
    const { monthlySalary } = req.body;
    const employee = await Employee.findOne({ id: req.params.id });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const salaryIndex = employee.salaryByYear.findIndex(s => s.year === req.params.year);
    if (salaryIndex === -1) {
      return res.status(404).json({ message: 'Salary for this year not found' });
    }

    employee.salaryByYear[salaryIndex].monthlySalary = monthlySalary;
    await employee.save();
    
    await logActivity(req, 'EMPLOYEE_SALARY_UPDATE', 'Employee', employee.id, employee.fullName || employee.name, `Salary updated for year ${req.params.year}: ${employee.fullName || employee.name}`);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update employee status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    await logActivity(req, 'EMPLOYEE_STATUS_CHANGE', 'Employee', employee.id, employee.fullName || employee.name, `Employee status changed to ${status}: ${employee.fullName || employee.name}`);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    await logActivity(req, 'EMPLOYEE_DELETE', 'Employee', employee.id, employee.fullName || employee.name, `Employee deleted: ${employee.fullName || employee.name}`);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;