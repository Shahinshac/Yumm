import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext';
import { SecurityGuard } from './components/SecurityGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
const Login = lazy(() => import('./pages/Login'));

// Customer
const HomeFeed = lazy(() => import('./pages/customer/HomeFeed'));
const SearchDiscovery = lazy(() => import('./pages/customer/SearchDiscovery'));
const RestaurantMenu = lazy(() => import('./pages/customer/RestaurantMenu'));
const CartCheckout = lazy(() => import('./pages/customer/CartCheckout'));
const OrderTracking = lazy(() => import('./pages/customer/OrderTracking'));
const OrderHistory = lazy(() => import('./pages/customer/OrderHistory'));
const UserProfile = lazy(() => import('./pages/customer/UserProfile'));

// Owner
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
const OwnerOrders = lazy(() => import('./pages/owner/OwnerOrders'));
const OwnerInventory = lazy(() => import('./pages/owner/OwnerInventory'));

// Admin
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminRestaurants = lazy(() => import('./pages/admin/AdminRestaurants'));
const AdminApprovals = lazy(() => import('./pages/admin/AdminApprovals'));
const AdminPlaceholder = lazy(() => import('./pages/admin/AdminPlaceholder'));

// Partner
const PartnerNavigation = lazy(() => import('./pages/partner/PartnerNavigation'));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "946437330680-9r4mutghresee1heq36ailmtrh7drtv1.apps.googleusercontent.com";

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <SecurityGuard>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Auth */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<Login />} />

                  {/* Customer */}
                  <Route path="/customer" element={<ProtectedRoute role="customer"><HomeFeed /></ProtectedRoute>} />
                  <Route path="/customer/search" element={<ProtectedRoute role="customer"><SearchDiscovery /></ProtectedRoute>} />
                  <Route path="/customer/restaurant/:id" element={<ProtectedRoute role="customer"><RestaurantMenu /></ProtectedRoute>} />
                  <Route path="/customer/cart" element={<ProtectedRoute role="customer"><CartCheckout /></ProtectedRoute>} />
                  <Route path="/customer/track/:orderId" element={<ProtectedRoute role="customer"><OrderTracking /></ProtectedRoute>} />
                  <Route path="/customer/orders" element={<ProtectedRoute role="customer"><OrderHistory /></ProtectedRoute>} />
                  <Route path="/customer/profile" element={<ProtectedRoute role="customer"><UserProfile /></ProtectedRoute>} />

                  {/* Owner */}
                  <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>} />
                  <Route path="/owner/orders" element={<ProtectedRoute role="owner"><OwnerOrders /></ProtectedRoute>} />
                  <Route path="/owner/inventory" element={<ProtectedRoute role="owner"><OwnerInventory /></ProtectedRoute>} />

                  {/* Admin */}
                  <Route path="/admin" element={<ProtectedRoute role="admin"><AdminOverview /></ProtectedRoute>} />
                  <Route path="/admin/approvals" element={<ProtectedRoute role="admin"><AdminApprovals /></ProtectedRoute>} />
                  <Route path="/admin/restaurants" element={<ProtectedRoute role="admin"><AdminRestaurants /></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminPlaceholder title="Live Orders" active="orders" /></ProtectedRoute>} />
                  <Route path="/admin/drivers" element={<ProtectedRoute role="admin"><AdminPlaceholder title="Driver Fleet" active="drivers" /></ProtectedRoute>} />
                  <Route path="/admin/financials" element={<ProtectedRoute role="admin"><AdminPlaceholder title="Financial Operations" active="financials" /></ProtectedRoute>} />
                  <Route path="/admin/disputes" element={<ProtectedRoute role="admin"><AdminPlaceholder title="Dispute Center" active="disputes" /></ProtectedRoute>} />

                  {/* Partner */}
                  <Route path="/partner" element={<ProtectedRoute role="partner"><PartnerNavigation /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
            </SecurityGuard>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
