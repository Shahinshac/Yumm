/**
 * Login Page - 26-07 RESERVE BANK
 * Modern, Professional Banking UI
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
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="login-content">
        {/* Left Side - Info */}
        <div className="login-info">
          <div className="info-content">
            <div className="bank-logo-large">
              <span className="logo-text">26</span>
            </div>
            <h1>26-07 RESERVE BANK</h1>
            <p className="tagline">Secure Digital Banking</p>

            <div className="features-list">
              <div className="feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Enterprise-grade Security</span>
              </div>
              <div className="feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Real-time Transactions</span>
              </div>
              <div className="feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>24/7 Account Access</span>
              </div>
              <div className="feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Advanced Analytics</span>
              </div>
            </div>

            <div className="info-footer">
              <p>Join millions of users managing their finances securely</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-wrapper">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            {/* Form Error */}
            {errors.form && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{errors.form}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username">Username or Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 9a2.25 2.25 0 100-4.5A2.25 2.25 0 009 9zm0 1.5c-3 0-4.5 1.5-4.5 4.5v1.5h9v-1.5c0-3-1.5-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <input
                  id="username"
                  type="text"
                  name="username"
                  className={`form-input ${errors.username ? 'input-error' : ''}`}
                  placeholder="shahinsha"
                  value={form.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 8.25h10.5c.825 0 1.5.675 1.5 1.5v6c0 .825-.675 1.5-1.5 1.5h-10.5c-.825 0-1.5-.675-1.5-1.5v-6c0-.825.675-1.5 1.5-1.5z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5.25 8.25v-1.5a3.75 3.75 0 117.5 0v1.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="9" cy="12.75" r=".75" fill="currentColor" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Remember Me */}
            <div className="form-checkbox">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Keep me signed in</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="form-footer">
            <p>© 2026 26-07 Reserve Bank. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
