import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/store';

export default function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return <div className="loading">Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (requiredRole && user?.role !== requiredRole) {
    return (
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
    );
  }

  return children;
}
