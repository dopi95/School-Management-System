import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
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
      const lastEmployee = await Employee.findOne().sort({ id: -1 });
      const lastId = lastEmployee ? parseInt(lastEmployee.id.replace('EMP', '')) : 0;
      req.body.id = `EMP${String(lastId + 1).padStart(3, '0')}`;
    }

    const existingEmployee = await Employee.findOne({ id: req.body.id });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();
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
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;