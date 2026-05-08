import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * SecurityGuard provides a high-level protection layer.
 * It monitors the session integrity and ensures role-path alignment.
 */
export const SecurityGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, showNotification } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const path = location.pathname;
    const role = currentUser.role;

    // 1. Role-Path Alignment Check
    const isAccessingForbidden = (
      (role === 'customer' && (path.startsWith('/admin') || path.startsWith('/owner') || path.startsWith('/partner'))) ||
      (role === 'owner' && (path.startsWith('/admin') || path.startsWith('/customer'))) ||
      (role === 'partner' && (path.startsWith('/admin') || path.startsWith('/customer'))) ||
      (role === 'admin' && path.startsWith('/customer')) // Admin can view but maybe not place orders
    );

    if (isAccessingForbidden) {
      showNotification('Access Redirect: Returning to your authorized portal.', 'info');
      const home = role === 'customer' ? '/customer' : `/${role}`;
      navigate(home);
    }

    // 2. Session Integrity is handled by AppContext state synchronization.
  }, [location.pathname, currentUser, logout, navigate, showNotification]);

  return <>{children}</>;
};
