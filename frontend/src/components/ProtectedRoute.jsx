/**
 * ProtectedRoute - Route guard with authentication and optional role-based authorization
 */
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';

export function ProtectedRoute({ children, requiredRoles = null }) {
  const { isAuthenticated, loading, user } = useAuthStore();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  // Check role-based access if required roles are specified
  if (requiredRoles && !Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's role
    const rolePageMap = {
      admin: '/admin-dashboard',
      staff: '/staff-dashboard',
      customer: '/dashboard'
    };
    return <Navigate to={rolePageMap[user.role] || '/dashboard'} />;
  }

  return children;
}
