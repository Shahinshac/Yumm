/**
 * Register Page - 26-07 RESERVE BANK
 * User account creation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import '../styles/register.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (form.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (form.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.username) {
      newErrors.username = 'Username is required';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    const result = await register({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      username: form.username,
      password: form.password,
    });
    setLoading(false);

    if (result.success) {
      // Registration successful, redirect to login
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
    } else {
      setErrors({ form: result.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="register-page">
      <div className="register-background"></div>

      <div className="register-wrapper">
        <div className="register-card">
          {/* Bank Header */}
          <div className="register-header">
            <div className="bank-logo">26</div>
            <h1 className="bank-name">RESERVE BANK</h1>
            <p className="bank-tagline">Create Your Account</p>
          </div>

          {/* Register Form */}
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Form Level Error */}
            {errors.form && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.form}
              </div>
            )}

            {/* First Name Field */}
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>

            {/* Last Name Field */}
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                className={`form-input ${errors.username ? 'input-error' : ''}`}
                placeholder="johndoe123"
                value={form.username}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter password (min 8 chars)"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
              <p className="password-hint">Must contain uppercase, lowercase, and numbers</p>
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`register-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="form-divider">
            <span>Already have an account?</span>
          </div>

          {/* Login Link */}
          <div className="login-section">
            <a href="/login" className="login-button">
              Sign In Instead
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="register-footer">
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

export default RegisterPage;
