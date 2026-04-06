import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import '../styles/auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(form.username, form.password);
    if (result.success) {
      if (result.role === 'admin') navigate('/admin/dashboard');
      else if (result.role === 'restaurant') navigate('/restaurant/dashboard');
      else if (result.role === 'delivery') navigate('/delivery/home');
      else navigate('/customer/home');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🍕 FoodHub</h1>
        <p className="subtitle">Food Delivery App</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-users">
          <h3>Demo Users:</h3>
          <p>👤 customer / customer123</p>
          <p>🏪 restaurant / rest123</p>
          <p>🚚 delivery / delivery123</p>
          <p>👨‍💼 admin / admin123</p>
        </div>

        <p className="auth-link">
          Don't have account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}
