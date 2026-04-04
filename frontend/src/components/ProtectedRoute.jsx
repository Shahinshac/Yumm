/**
 * ProtectedRoute - Route guard for authenticated pages
 */
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}
