/**
 * Main App Component with Routing
 * Secure Banking System - No Public Registration
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ChangePasswordFirstLoginPage } from './pages/ChangePasswordFirstLogin';
import { DashboardPage } from './pages/Dashboard';
import { AdminDashboardPage } from './pages/AdminDashboard';
import { StaffDashboardPage } from './pages/StaffDashboard';
import './styles/App.css';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check auth session only once on app mount
    checkAuth();
  }, []); // Empty dependency array - run only on mount

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-password-first-login" element={<ChangePasswordFirstLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles={['customer']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-dashboard"
          element={
            <ProtectedRoute requiredRoles={['staff', 'admin']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
