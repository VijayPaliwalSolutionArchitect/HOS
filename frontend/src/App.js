import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/student/Dashboard';
import StudentExams from './pages/student/Exams';
import TakeExam from './pages/student/TakeExam';
import ExamResult from './pages/student/ExamResult';
import ManagerDashboard from './pages/manager/Dashboard';
import QuestionBank from './pages/manager/QuestionBank';
import ExamBuilder from './pages/manager/ExamBuilder';
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/Users';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects = {
      STUDENT: '/student/dashboard',
      TEACHER: '/manager/dashboard',
      MANAGER: '/manager/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return <Navigate to={roleRedirects[user?.role] || '/login'} replace />;
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const roleRedirects = {
      STUDENT: '/student/dashboard',
      TEACHER: '/manager/dashboard',
      MANAGER: '/manager/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return <Navigate to={roleRedirects[user.role] || '/student/dashboard'} replace />;
  }

  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exams"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/:examId"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <TakeExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/result/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <ExamResult />
              </ProtectedRoute>
            }
          />

          {/* Manager/Teacher Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'MANAGER', 'ADMIN']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/questions"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'MANAGER', 'ADMIN']}>
                <QuestionBank />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/exams"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'MANAGER', 'ADMIN']}>
                <ExamBuilder />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersManagement />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;
