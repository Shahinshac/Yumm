import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/store';

export default function DeliveryHome() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🚚 Delivery Dashboard</h1>
        <button onClick={() => { logout(); navigate('/login'); }} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="content">
        <h2>Welcome, {user?.full_name || user?.username}!</h2>
        <p>📦 Available Orders Coming Soon</p>
        <p>🗺️ Real-time Tracking Coming Soon</p>
        <p>💰 Earnings Dashboard Coming Soon</p>
      </div>
    </div>
  );
}
