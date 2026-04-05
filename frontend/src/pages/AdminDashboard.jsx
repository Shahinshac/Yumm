import { useEffect, useState } from 'react';
import { useAuthStore } from '../context/authStore';
import { userAPI, accountAPI } from '../services/api';
import '../styles/admin-dashboard.css';

export default function AdminDashboard() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [accountForm, setAccountForm] = useState({
    account_type: 'savings',
    initial_balance: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, customersRes, accountsRes] = await Promise.all([
        userAPI.getAll(),
        userAPI.getCustomers(),
        accountAPI.getAll()
      ]);
      setUsers(usersRes.data.users || []);
      setCustomers(customersRes.data.customers || []);
      setAccounts(accountsRes.data.accounts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    try {
      await accountAPI.create({
        customer_id: selectedCustomer.id,
        account_type: accountForm.account_type,
        initial_balance: parseFloat(accountForm.initial_balance) || 0,
      });
      alert(`Account created for ${selectedCustomer.first_name}!`);
      setShowCreateAccount(false);
      setSelectedCustomer(null);
      setAccountForm({ account_type: 'savings', initial_balance: 0 });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create account');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => { logout(); window.location.href = '/login'; }}>
          Logout
        </button>
      </header>

      <nav className="admin-nav">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'accounts' ? 'active' : ''}
          onClick={() => setActiveTab('accounts')}
        >
          Accounts
        </button>
      </nav>

      <div className="admin-content">
        {activeTab === 'users' && (
          <section>
            <h2>👥 All Users</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td className={`role ${u.role}`}>{u.role}</td>
                    <td>{u.is_active ? '✅ Active' : '❌ Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'accounts' && (
          <section>
            <div className="section-header">
              <h2>💳 All Accounts</h2>
              <button onClick={() => setShowCreateAccount(true)}>
                ➕ Create Account
              </button>
            </div>

            {showCreateAccount && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Create Account</h3>

                  <div className="form-group">
                    <label>Select Customer</label>
                    <select
                      value={selectedCustomer?.id || ''}
                      onChange={(e) => {
                        const cust = customers.find((c) => c.id === e.target.value);
                        setSelectedCustomer(cust);
                      }}
                    >
                      <option value="">-- Select Customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.first_name} {c.last_name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCustomer && (
                    <>
                      <div className="form-group">
                        <label>Account Type</label>
                        <select
                          value={accountForm.account_type}
                          onChange={(e) =>
                            setAccountForm({
                              ...accountForm,
                              account_type: e.target.value,
                            })
                          }
                        >
                          <option value="savings">Savings</option>
                          <option value="current">Current</option>
                          <option value="salary">Salary</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Initial Balance</label>
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
                        />
                      </div>

                      <div className="modal-actions">
                        <button onClick={() => setShowCreateAccount(false)}>
                          Cancel
                        </button>
                        <button onClick={handleCreateAccount} className="primary">
                          Create
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id}>
                    <td>{acc.account_number}</td>
                    <td>{acc.account_type}</td>
                    <td>₹{acc.balance.toFixed(2)}</td>
                    <td>{acc.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
