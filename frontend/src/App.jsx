import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { StudentsProvider } from './context/StudentsContext.jsx';
import { EmployeesProvider } from './context/EmployeesContext.jsx';
import { AdminsProvider } from './context/AdminsContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import AddStudent from './pages/AddStudent';
import Teachers from './pages/Teachers';
import TeacherDetail from './pages/TeacherDetail';
import AddTeacher from './pages/AddTeacher';
import Admins from './pages/Admins';
import AddAdmin from './pages/AddAdmin';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDetails from './pages/AdminDetails';
import Payments from './pages/Payments';
import InactiveStudents from './pages/InactiveStudents';
import InactiveEmployees from './pages/InactiveEmployees';
import AdminDetail from './pages/AdminDetail';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/students" element={
        <ProtectedRoute>
          <Layout><Students /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/students/add" element={
        <ProtectedRoute>
          <Layout><AddStudent /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/students/edit/:id" element={
        <ProtectedRoute>
          <Layout><AddStudent /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/students/:id" element={
        <ProtectedRoute>
          <Layout><StudentDetail /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/teachers" element={
        <ProtectedRoute>
          <Layout><Teachers /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/teachers/add" element={
        <ProtectedRoute>
          <Layout><AddTeacher /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/teachers/edit/:id" element={
        <ProtectedRoute>
          <Layout><AddTeacher /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/teachers/:id" element={
        <ProtectedRoute>
          <Layout><TeacherDetail /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admins" element={
        <ProtectedRoute>
          <Layout><Admins /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admins/add" element={
        <ProtectedRoute>
          <Layout><AddAdmin /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admins/edit/:id" element={
        <ProtectedRoute>
          <Layout><AddAdmin /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admins/:id" element={
        <ProtectedRoute>
          <Layout><AdminDetail /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout><Settings /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admins/:id" element={
        <ProtectedRoute>
          <Layout><AdminDetails /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/payments" element={
        <ProtectedRoute>
          <Layout><Payments /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/inactive-students" element={
        <ProtectedRoute>
          <Layout><InactiveStudents /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/inactive-employees" element={
        <ProtectedRoute>
          <Layout><InactiveEmployees /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <StudentsProvider>
            <EmployeesProvider>
              <AdminsProvider>
                <Router>
                  <div className="App">
                    <AppRoutes />
                  </div>
                </Router>
              </AdminsProvider>
            </EmployeesProvider>
          </StudentsProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;