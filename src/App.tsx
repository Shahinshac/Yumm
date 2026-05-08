import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext';

const GOOGLE_CLIENT_ID = "946437330680-9r4mutghresee1heq36ailmtrh7drtv1.apps.googleusercontent.com";
// Mobile Client IDs for reference:
// Android: 946437330680-87ma1tf4dg56rcp0mk4moi00r7f3159m.apps.googleusercontent.com
// iOS: 946437330680-drp10qt4b720rhdl6h19uruj1pqirsat.apps.googleusercontent.com

// Auth
import Login from './pages/Login';

// Customer
import HomeFeed from './pages/customer/HomeFeed';
import SearchDiscovery from './pages/customer/SearchDiscovery';
import RestaurantMenu from './pages/customer/RestaurantMenu';
import CartCheckout from './pages/customer/CartCheckout';
import OrderTracking from './pages/customer/OrderTracking';
import OrderHistory from './pages/customer/OrderHistory';
import UserProfile from './pages/customer/UserProfile';

// Owner
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerOrders from './pages/owner/OwnerOrders';

// Admin
import { AdminOverview } from './pages/admin/AdminOverview';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminApprovals from './pages/admin/AdminApprovals';

// Partner
import PartnerNavigation from './pages/partner/PartnerNavigation';

function App() {
  return (
    <AppProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Customer */}
            <Route path="/customer" element={<HomeFeed />} />
            <Route path="/customer/search" element={<SearchDiscovery />} />
            <Route path="/customer/restaurant/:id" element={<RestaurantMenu />} />
            <Route path="/customer/cart" element={<CartCheckout />} />
            <Route path="/customer/track/:orderId" element={<OrderTracking />} />
            <Route path="/customer/orders" element={<OrderHistory />} />
            <Route path="/customer/profile" element={<UserProfile />} />

            {/* Owner */}
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/orders" element={<OwnerOrders />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
            <Route path="/admin/restaurants" element={<AdminRestaurants />} />

            {/* Partner */}
            <Route path="/partner" element={<PartnerNavigation />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </AppProvider>
  );
}

export default App;
