import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/store';

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🏪 Restaurant Dashboard</h1>
        <button onClick={() => { logout(); navigate('/login'); }} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="content">
        <h2>Welcome, {user?.full_name || user?.username}!</h2>
        <p>📝 Order Management Coming Soon</p>
        <p>📊 Analytics Coming Soon</p>
        <p>📋 Menu Management Coming Soon</p>
      </div>
    </div>
  );
}
