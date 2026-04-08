import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Layout from './components/Layout';

import CustomerHome from './pages/customer/CustomerHome';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminDashboard from './pages/admin/AdminDashboard';
import RestaurantRegister from './pages/RestaurantRegister';
import DeliveryRegister from './pages/DeliveryRegister';

// Role-based protection wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register/restaurant" element={!user ? <RestaurantRegister /> : <Navigate to="/" />} />
      <Route path="/register/delivery" element={!user ? <DeliveryRegister /> : <Navigate to="/" />} />
      <Route path="/unauthorized" element={<div className="p-10 text-red-500 font-bold text-center">Unauthorized Access</div>} />
      
      {/* Root Redirect based on Role */}
      <Route path="/" element={
        !user ? <Navigate to="/login" /> :
        user.role === 'customer' ? <Navigate to="/home" /> :
        user.role === 'restaurant' ? <Navigate to="/restaurant/dashboard" /> :
        user.role === 'delivery' ? <Navigate to="/delivery/dashboard" /> :
        user.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
        <Navigate to="/login" />
      } />

      {/* Protected Dashboards (Wrapped in Layout) */}
      <Route element={<Layout />}>
        {/* Customer Routes */}
        <Route path="/home" element={<ProtectedRoute allowedRoles={['customer']}><CustomerHome /></ProtectedRoute>} />
        
        {/* Restaurant Routes */}
        <Route path="/restaurant/dashboard" element={<ProtectedRoute allowedRoles={['restaurant']}><RestaurantDashboard /></ProtectedRoute>} />

        {/* Delivery Routes */}
        <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryDashboard /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={['admin']}><AdminApprovals /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
