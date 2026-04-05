/**
 * AccountCreationModal.jsx - Fixed Account Creation Component
 *
 * Proper workflow for admin/staff to create accounts FOR customers
 * NOT for themselves
 */

import React, { useState, useEffect } from 'react';
import { userAPI, accountAPI } from '../api/api';

export const AccountCreationModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [step, setStep] = useState(1); // Step 1: Select Customer, Step 2: Account Details
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2: Account creation form
  const [accountForm, setAccountForm] = useState({
    account_type: 'savings',
    initial_balance: 0,
  });

  // Fetch customers when modal opens
  useEffect(() => {
    if (isOpen && ['admin', 'staff'].includes(user?.role)) {
      fetchCustomers();
    }
  }, [isOpen, user?.role]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');

      // Call the new /api/users/customers endpoint
      const response = await userAPI.getCustomers(searchTerm);

      setCustomers(response.data.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCustomers = (term) => {
    setSearchTerm(term);
    // Could add debouncing here for production
    fetchCustomers();
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setStep(2); // Move to account details step
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Call account creation API with customer_id
      const response = await accountAPI.create({
        customer_id: selectedCustomer.id,
        account_type: accountForm.account_type,
        initial_balance: parseFloat(accountForm.initial_balance) || 0,
      });

      // Success!
      alert(
        `✅ Account created successfully!\n\n` +
        `Customer: ${selectedCustomer.first_name} ${selectedCustomer.last_name}\n` +
        `Account Number: ${response.data.account.account_number}\n` +
        `Account Type: ${accountForm.account_type}\n` +
        `Balance: ₹${accountForm.initial_balance}`
      );

      // Call success callback and close
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset and close
      setStep(1);
      setSelectedCustomer(null);
      setAccountForm({ account_type: 'savings', initial_balance: 0 });
      onClose();
    } catch (err) {
      console.error('Error creating account:', err);
      setError(
        err.response?.data?.error || 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Only admin/staff can create accounts
  if (!['admin', 'staff'].includes(user?.role)) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>❌ Access Denied</h2>
          <p>Only admin/staff can create accounts</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        {step === 1 ? (
          // STEP 1: Select Customer
          <div className="account-creation-step">
            <h2>📋 Create Account - Step 1: Select Customer</h2>

            {error && <div className="error-box">{error}</div>}

            <div className="form-group">
              <label>🔍 Search Customer:</label>
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => handleSearchCustomers(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="customers-list">
              {loading ? (
                <p>Loading customers...</p>
              ) : customers.length === 0 ? (
                <p>No customers found</p>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="customer-card"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="customer-info">
                      <h3>{customer.first_name} {customer.last_name}</h3>
                      <p>📧 {customer.email}</p>
                      <p>👤 @{customer.username}</p>
                      {customer.phone_number && (
                        <p>📱 {customer.phone_number}</p>
                      )}
                    </div>
                    <div className="select-btn">→</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          // STEP 2: Account Details
          <div className="account-creation-step">
            <h2>📝 Create Account - Step 2: Account Details</h2>

            {error && <div className="error-box">{error}</div>}

            <div className="selected-customer">
              <p>
                <strong>Customer Selected:</strong>{' '}
                {selectedCustomer?.first_name} {selectedCustomer?.last_name}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSelectedCustomer(null);
                }}
              >
                ← Change Customer
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="form">
              <div className="form-group">
                <label>Account Type:</label>
                <select
                  value={accountForm.account_type}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      account_type: e.target.value,
                    })
                  }
                  required
                >
                  <option value="savings">💰 Savings</option>
                  <option value="current">💼 Current</option>
                  <option value="salary">📊 Salary</option>
                </select>
              </div>

              <div className="form-group">
                <label>Initial Balance:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={accountForm.initial_balance}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      initial_balance: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Creating...' : '✅ Create Account'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * CSS Styles to add to your stylesheet:
 */
const styles = `
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #000;
}

.account-creation-step h2 {
  margin-bottom: 20px;
  color: #333;
}

.error-box {
  background: #ffe6e6;
  color: #d32f2f;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #d32f2f;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.customers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}

.customer-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.customer-card:hover {
  background: #f5f5f5;
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.customer-info h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.customer-info p {
  margin: 4px 0;
  color: #666;
  font-size: 13px;
}

.select-btn {
  font-size: 24px;
  color: #007bff;
}

.selected-customer {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-customer p {
  margin: 0;
  color: #333;
}

.selected-customer button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.selected-customer button:hover {
  background: #0056b3;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.submit-btn {
  background: #28a745;
  color: white;
}

.submit-btn:hover {
  background: #218838;
}

.submit-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`;
