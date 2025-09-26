import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { StudentsProvider } from './context/StudentsContext.jsx';
import { SpecialStudentsProvider } from './context/SpecialStudentsContext.jsx';
import { EmployeesProvider } from './context/EmployeesContext.jsx';
import { PaymentsProvider } from './context/PaymentsContext.jsx';
import { SpecialPaymentsProvider } from './context/SpecialPaymentsContext.jsx';
import { AdminsProvider } from './context/AdminsContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import AddStudent from './pages/AddStudent';
import SpecialStudents from './pages/SpecialStudents';
import SpecialStudentDetail from './pages/SpecialStudentDetail';
import AddSpecialStudent from './pages/AddSpecialStudent';
import SpecialPayments from './pages/SpecialPayments';
import Teachers from './pages/Teachers';
import TeacherDetail from './pages/TeacherDetail';
import AddTeacher from './pages/AddTeacher';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminManagement from './pages/AdminManagement';
import AdminProfiles from './pages/AdminProfiles';
import Payments from './pages/Payments';
import InactiveStudents from './pages/InactiveStudents';
import InactiveEmployees from './pages/InactiveEmployees';
import PermissionRoute from './components/ProtectedRoute.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  
  React.useEffect(() => {
    // Check auth status when component mounts
    if (!loading) {
      checkAuth();
    }
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/reset-password/:token" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword />} />
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/students" element={
        <ProtectedRoute>
          <Layout>
            <PermissionRoute permission="students" section="student management">
              <Students />
            </PermissionRoute>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/students/add" element={
        <ProtectedRoute>
          <Layout>
            <PermissionRoute permission="students" section="student management">
              <AddStudent />
            </PermissionRoute>
          </Layout>
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
      
      <Route path="/special-students" element={
        <ProtectedRoute>
          <Layout>
            <PermissionRoute permission="specialStudents" section="special student management">
              <SpecialStudents />
            </PermissionRoute>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/special-students/add" element={
        <ProtectedRoute>
          <Layout>
            <PermissionRoute permission="specialStudents" section="special student management">
              <AddSpecialStudent />
            </PermissionRoute>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/special-students/edit/:id" element={
        <ProtectedRoute>
          <Layout><AddSpecialStudent /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/special-students/:id" element={
        <ProtectedRoute>
          <Layout><SpecialStudentDetail /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/teachers" element={
        <ProtectedRoute>
          <Layout>
            <PermissionRoute permission="employees" section="employee management">
              <Teachers />
            </PermissionRoute>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/teachers/add" element={
        <ProtectedRoute>
          <Layout>
            <PermissionRoute permission="employees" section="employee management">
              <AddTeacher />
            </PermissionRoute>
          </Layout>
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
      
      <Route path="/admin-management" element={
        <ProtectedRoute>
          <Layout>
            <PermissionRoute permission="admins" section="admin management">
              <AdminManagement />
            </PermissionRoute>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin-profiles" element={
        <ProtectedRoute>
          <Layout><AdminProfiles /></Layout>
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
      

      
      <Route path="/payments" element={
        <ProtectedRoute>
          <Layout><Payments /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/special-payments" element={
        <ProtectedRoute>
          <Layout>
            <PermissionRoute permission="specialPayments" section="special payments management">
              <SpecialPayments />
            </PermissionRoute>
          </Layout>
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
            <SpecialStudentsProvider>
              <EmployeesProvider>
                <PaymentsProvider>
                  <SpecialPaymentsProvider>
                    <AdminsProvider>
                  <Router>
                    <div className="App">
                      <AppRoutes />
                    </div>
                  </Router>
                    </AdminsProvider>
                  </SpecialPaymentsProvider>
                </PaymentsProvider>
              </EmployeesProvider>
            </SpecialStudentsProvider>
          </StudentsProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;