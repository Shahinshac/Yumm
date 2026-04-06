import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/store';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>👨‍💼 Admin Dashboard</h1>
        <button onClick={() => { logout(); navigate('/login'); }} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="content">
        <h2>Welcome, {user?.full_name || user?.username}!</h2>
        <p>📊 Analytics Coming Soon</p>
        <p>👥 User Management Coming Soon</p>
        <p>🏪 Restaurant Management Coming Soon</p>
        <p>💼 Commission Tracking Coming Soon</p>
      </div>
    </div>
  );
}
