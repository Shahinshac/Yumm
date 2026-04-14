import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import CustomerLogin from './pages/CustomerLogin';
import PartnerLogin from './pages/PartnerLogin';
import AdminLogin from './pages/AdminLogin';
import Layout from './components/Layout';

import CustomerHome from './pages/customer/CustomerHome';
import CustomerCart from './pages/customer/CustomerCart';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerAddresses from './pages/customer/CustomerAddresses';
import CustomerPreferences from './pages/customer/CustomerPreferences';
import CustomerReviews from './pages/customer/CustomerReviews';
import OrderTracking from './pages/customer/OrderTracking';
import RestaurantDetails from './pages/customer/RestaurantDetails';

import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantMenu from './pages/restaurant/RestaurantMenu';
import RestaurantOrders from './pages/restaurant/RestaurantOrders';
import RestaurantSettings from './pages/restaurant/RestaurantSettings';

import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrders from './pages/delivery/DeliveryOrders';
import DeliveryHistory from './pages/delivery/DeliveryHistory';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLiveMap from './pages/admin/AdminLiveMap';

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
      <Route path="/login" element={!user ? <CustomerLogin /> : <Navigate to="/" />} />
      <Route path="/partner-login" element={!user ? <PartnerLogin /> : <Navigate to="/" />} />
      <Route path="/admin-login" element={!user ? <AdminLogin /> : <Navigate to="/" />} />
      
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
        <Route path="/restaurant/:id" element={<ProtectedRoute allowedRoles={['customer']}><RestaurantDetails /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute allowedRoles={['customer']}><CustomerCart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRoles={['customer']}><CustomerOrders /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute allowedRoles={['customer']}><CustomerReviews /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />
        <Route path="/profile/addresses" element={<ProtectedRoute allowedRoles={['customer']}><CustomerAddresses /></ProtectedRoute>} />
        <Route path="/profile/preferences" element={<ProtectedRoute allowedRoles={['customer']}><CustomerPreferences /></ProtectedRoute>} />
        <Route path="/orders/:orderId/track" element={<ProtectedRoute allowedRoles={['customer']}><OrderTracking /></ProtectedRoute>} />
        
        {/* Restaurant Routes */}
        <Route path="/restaurant/dashboard" element={<ProtectedRoute allowedRoles={['restaurant']}><RestaurantDashboard /></ProtectedRoute>} />
        <Route path="/restaurant/menu" element={<ProtectedRoute allowedRoles={['restaurant']}><RestaurantMenu /></ProtectedRoute>} />
        <Route path="/restaurant/orders" element={<ProtectedRoute allowedRoles={['restaurant']}><RestaurantOrders /></ProtectedRoute>} />
        <Route path="/restaurant/settings" element={<ProtectedRoute allowedRoles={['restaurant']}><RestaurantSettings /></ProtectedRoute>} />

        {/* Delivery Routes */}
        <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryDashboard /></ProtectedRoute>} />
        <Route path="/delivery/orders" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryOrders /></ProtectedRoute>} />
        <Route path="/delivery/history" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryHistory /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={['admin']}><AdminApprovals /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/restaurants" element={<ProtectedRoute allowedRoles={['admin']}><AdminRestaurants /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/fleet-map" element={<ProtectedRoute allowedRoles={['admin']}><AdminLiveMap /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
