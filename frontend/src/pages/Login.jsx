/**
 * Login Page - 26-07 RESERVE BANK
 * Modern Minimal Design
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import '../styles/login.css';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = 'Username or email is required';
    if (!form.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    const result = await login(form);
    setLoading(false);

    if (result.success) {
      if (result.role === 'admin') navigate('/admin-dashboard');
      else if (result.role === 'staff') navigate('/staff-dashboard');
      else navigate('/dashboard');
    } else {
      setErrors({ form: result.message || 'Invalid credentials' });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Logo & Title */}
        <div className="login-header">
          <div className="logo-circle">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Bank Building Icon */}
              <path d="M25 5L45 15V20H5V15L25 5Z" fill="currentColor" opacity="0.8"/>
              <rect x="8" y="20" width="34" height="20" rx="2" fill="currentColor" opacity="0.9"/>
              <rect x="12" y="24" width="5" height="8" rx="1" fill="white"/>
              <rect x="22" y="24" width="5" height="8" rx="1" fill="white"/>
              <rect x="32" y="24" width="5" height="8" rx="1" fill="white"/>
              <circle cx="25" cy="20" r="3" fill="white" opacity="0.7"/>
              <line x1="20" y1="40" x2="30" y2="40" stroke="white" strokeWidth="1.5" opacity="0.8"/>
            </svg>
          </div>
          <h1>26-07 BANK</h1>
          <p className="subtitle">Digital Banking</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form-new">
          {/* Error Alert */}
          {errors.form && (
            <div className="error-banner">
              <span>⚠️ {errors.form}</span>
            </div>
          )}

          {/* Username */}
          <div className="form-field">
            <label>Username or Email</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={loading}
              className={errors.username ? 'input-error' : ''}
              autoComplete="username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          {/* Password */}
          <div className="form-field">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button-new"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-mini"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2026 26-07 Reserve Bank. All rights reserved.</p>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="background-pattern"></div>
    </div>
  );
}

export default LoginPage;
