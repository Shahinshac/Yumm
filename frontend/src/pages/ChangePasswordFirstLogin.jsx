/**
 * Change Password - First Login
 * 26-07 RESERVE BANK
 *
 * Customers must change their password on first login
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import '../styles/change-password-first-login.css';

export function ChangePasswordFirstLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });

  const validateForm = () => {
    const newErrors = {};

    if (!form.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(form.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase letters';
    } else if (!/[a-z]/.test(form.newPassword)) {
      newErrors.newPassword = 'Password must contain lowercase letters';
    } else if (!/[0-9]/.test(form.newPassword)) {
      newErrors.newPassword = 'Password must contain numbers';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.newPassword !== form.confirmPassword) {
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

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/change-password-first-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            new_password: form.newPassword,
          }),
        }
      );

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const data = await response.json();
        setErrors({ form: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setErrors({ form: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="change-password-page">
        <div className="success-wrapper">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2>Password Changed Successfully!</h2>
            <p>Your password has been updated. Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="change-password-page">
      <div className="background"></div>

      <div className="wrapper">
        <div className="card">
          {/* Header */}
          <div className="header">
            <h1>Update Your Password</h1>
            <p>Your account was created with a temporary password. Please set a new secure password to continue.</p>
          </div>

          {/* Form */}
          <form className="form" onSubmit={handleSubmit}>
            {/* Form Error */}
            {errors.form && (
              <div className="alert alert-error">
                {errors.form}
              </div>
            )}

            {/* Password Requirements Info */}
            <div className="requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li className={form.newPassword.length >= 8 ? 'met' : ''}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(form.newPassword) ? 'met' : ''}>
                  One uppercase letter (A-Z)
                </li>
                <li className={/[a-z]/.test(form.newPassword) ? 'met' : ''}>
                  One lowercase letter (a-z)
                </li>
                <li className={/[0-9]/.test(form.newPassword) ? 'met' : ''}>
                  One number (0-9)
                </li>
              </ul>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
                placeholder="Enter your new password"
                value={form.newPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.newPassword && (
                <span className="field-error">{errors.newPassword}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm your new password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Continue to Dashboard'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 26-07 Reserve Bank. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ChangePasswordFirstLoginPage;
