import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';

export function ProtectedRoute({ children, requiredRoles = null }) {
  const { isAuthenticated, loading, user } = useAuthStore();

  if (loading) return <div className="loading">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    const rolePages = { admin: '/admin', staff: '/staff', customer: '/dashboard' };
    return <Navigate to={rolePages[user?.role] || '/login'} />;
  }

  return children;
}
