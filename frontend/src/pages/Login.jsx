/**
 * Login Page - 26-07 RESERVE BANK
 * Secure Enterprise Banking - No Public Registration
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

  const validateForm = () => {
    const newErrors = {};

    if (!form.username) {
      newErrors.username = 'Username or email is required';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      // Check if user needs to change password on first login
      if (result.is_first_login && result.role === 'customer') {
        navigate('/change-password-first-login');
      } else if (result.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (result.role === 'staff') {
        navigate('/staff-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrors({ form: result.message || 'Invalid credentials' });
    }
  };

  return (
    <div className="login-page">
      <div className="login-background"></div>

      <div className="login-wrapper">
        <div className="login-card">
          {/* Bank Header */}
          <div className="login-header">
            <div className="bank-logo">26</div>
            <h1 className="bank-name">RESERVE BANK</h1>
            <p className="bank-tagline">Secure Digital Banking</p>
          </div>

          {/* Info Banner */}
          <div className="info-banner">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>Customer accounts are created by bank staff. Contact your administrator for account access.</p>
          </div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Form Level Error */}
            {errors.form && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.form}
              </div>
            )}

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username or Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 9a2.25 2.25 0 100-4.5A2.25 2.25 0 009 9zm0 1.5c-3 0-4.5 1.5-4.5 4.5v1.5h9v-1.5c0-3-1.5-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  id="username"
                  type="text"
                  name="username"
                  className={`form-input ${errors.username ? 'input-error' : ''}`}
                  placeholder="Enter your username or email"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setErrors(prev => ({ ...prev, username: '' }))}
                  disabled={loading}
                />
              </div>
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 8.25h10.5c.825 0 1.5.675 1.5 1.5v6c0 .825-.675 1.5-1.5 1.5h-10.5c-.825 0-1.5-.675-1.5-1.5v-6c0-.825.675-1.5 1.5-1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.25 8.25v-1.5a3.75 3.75 0 117.5 0v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="12.75" r=".75" fill="currentColor" />
                </svg>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setErrors(prev => ({ ...prev, password: '' }))}
                  disabled={loading}
                />
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Forgot Password Link */}
            <div className="form-actions">
              <a href="/forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="button-loader">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path d="M12 2a10 10 0 010 20" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <div className="footer-content">
          <p className="footer-copy">© 2026 26-07 Reserve Bank. All rights reserved.</p>
          <nav className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/security">Security</a>
            <a href="/contact">Contact Us</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;

