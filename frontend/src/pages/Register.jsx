import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import '../styles/auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const result = await register(form);
    if (result.success) {
      alert('Registration successful! Please login.');
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🍕 FoodHub</h1>
        <p className="subtitle">Create Account</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter phone number"
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

          <div className="form-group">
            <label>Register As</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="restaurant">Restaurant</option>
              <option value="delivery">Delivery Partner</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}
