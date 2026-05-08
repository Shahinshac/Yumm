import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: string | string[];
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(currentUser.role)) {
      // Role not authorized, redirect to their home or login
      const home = currentUser.role === 'customer' ? '/customer' : `/${currentUser.role}`;
      return <Navigate to={home} replace />;
    }
  }

  // Final High-Level Approval Guard
  const { isApproved, logout } = useApp();
  if (!isApproved(currentUser.role, currentUser.email, currentUser.name)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
