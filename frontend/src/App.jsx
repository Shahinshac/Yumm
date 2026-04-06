import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/store';

// Pages
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import CustomerHome from './pages/customer/Home';
import RestaurantMenu from './pages/customer/RestaurantMenu';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';
import MyOrders from './pages/customer/MyOrders';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import DeliveryHome from './pages/delivery/Home';
import AdminDashboard from './pages/admin/Dashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Routes */}
        <Route
          path="/customer/home"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/restaurant/:id"
          element={
            <ProtectedRoute requiredRole="customer">
              <RestaurantMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/checkout"
          element={
            <ProtectedRoute requiredRole="customer">
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute requiredRole="customer">
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/track/:orderId"
          element={
            <ProtectedRoute requiredRole="customer">
              <OrderTracking />
            </ProtectedRoute>
          }
        />

        {/* Restaurant Routes */}
        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute requiredRole="restaurant">
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />

        {/* Delivery Routes */}
        <Route
          path="/delivery/home"
          element={
            <ProtectedRoute requiredRole="delivery">
              <DeliveryHome />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate
                to={
                  user?.role === 'admin'
                    ? '/admin/dashboard'
                    : user?.role === 'restaurant'
                    ? '/restaurant/dashboard'
                    : user?.role === 'delivery'
                    ? '/delivery/home'
                    : '/customer/home'
                }
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
