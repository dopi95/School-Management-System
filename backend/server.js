import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import studentRoutes from "./src/routes/students.js";
import employeeRoutes from "./src/routes/employees.js";
import paymentRoutes from "./src/routes/payments.js";
import specialStudentRoutes from "./src/routes/specialStudents.js";
import specialPaymentRoutes from "./src/routes/specialPayments.js";
import authRoutes from "./src/routes/auth.js";
import { protect } from "./src/middleware/auth.js";
import { checkPermission, checkWritePermission } from "./src/middleware/permissions.js";

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://school-mnagement-system-frontend.onrender.com',
    /\.vercel\.app$/  // Allow all Vercel domains
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', protect, (req, res, next) => {
  // Check if accessing inactive students specifically
  if (req.path.includes('inactive') || req.query.status === 'inactive') {
    const writeActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (writeActions.includes(req.method)) {
      return checkWritePermission('inactiveStudents')(req, res, next);
    }
    return checkPermission('inactiveStudents')(req, res, next);
  }
  const writeActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (writeActions.includes(req.method)) {
    return checkWritePermission('students')(req, res, next);
  }
  return checkPermission('students')(req, res, next);
}, studentRoutes);
app.use('/api/employees', protect, (req, res, next) => {
  // Check if accessing inactive employees specifically
  if (req.path.includes('inactive') || req.query.status === 'inactive') {
    const writeActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (writeActions.includes(req.method)) {
      return checkWritePermission('inactiveEmployees')(req, res, next);
    }
    return checkPermission('inactiveEmployees')(req, res, next);
  }
  const writeActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (writeActions.includes(req.method)) {
    return checkWritePermission('employees')(req, res, next);
  }
  return checkPermission('employees')(req, res, next);
}, employeeRoutes);
app.use('/api/payments', protect, (req, res, next) => {
  const writeActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (writeActions.includes(req.method)) {
    return checkWritePermission('payments')(req, res, next);
  }
  return checkPermission('payments')(req, res, next);
}, paymentRoutes);
app.use('/api/special-students', protect, (req, res, next) => {
  const writeActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (writeActions.includes(req.method)) {
    return checkWritePermission('specialStudents')(req, res, next);
  }
  return checkPermission('specialStudents')(req, res, next);
}, specialStudentRoutes);
app.use('/api/special-payments', protect, (req, res, next) => {
  const writeActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (writeActions.includes(req.method)) {
    return checkWritePermission('specialPayments')(req, res, next);
  }
  return checkPermission('specialPayments')(req, res, next);
}, specialPaymentRoutes);

// Settings route (protected by settings permission)
app.get('/api/settings', protect, checkPermission('settings'), (req, res) => {
  res.json({ success: true, message: 'Settings access granted' });
});

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
