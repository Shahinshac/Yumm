/**
 * Professional Dashboard - Complete Admin & User Management
 * Hamburger Navigation + Full CRUD Operations
 */
import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/authStore';
import { accountAPI, transactionAPI, userAPI, authAPI } from '../services/api';
import '../styles/professional-dashboard.css';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [accountForm, setAccountForm] = useState({
    account_type: 'savings',
    initial_balance: 0,
  });

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'customer',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, txRes] = await Promise.all([
        accountAPI.getAll(),
        transactionAPI.getAll({ limit: 10 }),
      ]);
      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
      setTransactions(Array.isArray(txRes.data?.transactions) ? txRes.data.transactions : []);

      // Fetch users if admin
      if (user?.role === 'admin') {
        try {
          const usersRes = await userAPI.getAll();
          setUsers(Array.isArray(usersRes.data) ? usersRes.data : Array.isArray(usersRes.data?.users) ? usersRes.data.users : Array.isArray(usersRes.data?.data) ? usersRes.data.data : []);
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setAccounts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await accountAPI.create(accountForm);
      if (response.status === 201) {
        alert('Account created successfully!');
        setShowCreateAccount(false);
        setAccountForm({ account_type: 'savings', initial_balance: 0 });
        fetchData();
      }
    } catch (error) {
      alert('Failed to create account: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.register(userForm);
      if (response.status === 201) {
        alert('User created successfully!');
        setShowCreateUser(false);
        setUserForm({
          username: '',
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          role: 'customer',
        });
        fetchData();
      }
    } catch (error) {
      alert('Failed to create user: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await userAPI.delete(userId);
      if (response.status === 200) {
        alert('User deleted successfully!');
        fetchData();
      }
    } catch (error) {
      alert('Failed to delete user: ' + (error.response?.data?.error || error.message));
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  const menuItems = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'accounts', label: '💳 Accounts' },
    { id: 'transactions', label: '📝 Transactions' },
    { id: 'transfer', label: '💸 Transfer Money' },
    { id: 'bills', label: '📱 Pay Bills' },
    { id: 'cards', label: '🎫 Cards & ATM' },
    { id: 'loans', label: '📊 Loans' },
    { id: 'beneficiaries', label: '👥 Beneficiaries' },
    { id: 'scheduled', label: '⏰ Scheduled Payments' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  // Add admin menu item for admin users
  if (user?.role === 'admin') {
    menuItems.push({ id: 'users', label: '👨‍💼 User Management' });
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="professional-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="bank-logo">🏛️</div>
          <h2>26-07 BANK</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
            >
              <span className="menu-icon">{item.label.split(' ')[0]}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <h1>Welcome, {user?.first_name}! 👋</h1>
          <div className="user-info">
            <span className="user-role">{user?.role.toUpperCase()}</span>
          </div>
        </header>

        {/* Content */}
        <div className="content-area">
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <section className="section">
              <div className="section-header">
                <h2>Dashboard Overview</h2>
              </div>

              <div className="cards-grid">
                <div className="card total-balance">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <h3>Total Balance</h3>
                    <p className="amount">₹{totalBalance.toFixed(2)}</p>
                    <small>{accounts.length} accounts</small>
                  </div>
                </div>

                <div className="card">
                  <div className="card-icon">💳</div>
                  <div className="card-content">
                    <h3>Accounts</h3>
                    <p className="amount">{accounts.length}</p>
                    <small>Active accounts</small>
                  </div>
                </div>

                <div className="card">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <h3>Transactions</h3>
                    <p className="amount">{transactions.length}</p>
                    <small>Recent activity</small>
                  </div>
                </div>

                <div className="card">
                  <div className="card-icon">⭐</div>
                  <div className="card-content">
                    <h3>Status</h3>
                    <p className="amount">✓ Active</p>
                    <small>Account verified</small>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="section-box">
                <h3>Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id}>
                          <td>{tx.transaction_type}</td>
                          <td>₹{parseFloat(tx.amount).toFixed(2)}</td>
                          <td><span className={`badge badge-${tx.status}`}>{tx.status}</span></td>
                          <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty">No transactions yet</p>
                )}
              </div>
            </section>
          )}

          {/* ACCOUNTS SECTION */}
          {activeSection === 'accounts' && (
            <section className="section">
              <div className="section-header">
                <h2>Your Accounts</h2>
                <button className="submit-btn" onClick={() => setShowCreateAccount(true)}>➕ Create Account</button>
              </div>

              {showCreateAccount && (
                <div className="section-box form-container">
                  <h3>Create New Account</h3>
                  <form onSubmit={handleCreateAccount} className="form">
                    <div className="form-group">
                      <label>Account Type</label>
                      <select value={accountForm.account_type} onChange={(e) => setAccountForm({...accountForm, account_type: e.target.value})}>
                        <option value="savings">Savings Account</option>
                        <option value="current">Current Account</option>
                        <option value="salary">Salary Account</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Initial Balance</label>
                      <input type="number" step="0.01" value={accountForm.initial_balance} onChange={(e) => setAccountForm({...accountForm, initial_balance: e.target.value})} />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Create Account</button>
                      <button type="button" className="cancel-btn" onClick={() => setShowCreateAccount(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {accounts.length > 0 ? (
                <div className="accounts-list">
                  {accounts.map((account) => (
                    <div key={account.id} className="account-item">
                      <div className="account-icon">💳</div>
                      <div className="account-details">
                        <h4>{account.account_type?.toUpperCase()}</h4>
                        <p>Account: {account.account_number}</p>
                        <small>Status: <span className="badge">{account.status}</span></small>
                      </div>
                      <div className="account-balance">
                        <p className="balance">₹{parseFloat(account.balance).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>💳 No accounts yet</p>
                  <button className="submit-btn" onClick={() => setShowCreateAccount(true)}>Create Your First Account</button>
                </div>
              )}
            </section>
          )}

          {/* TRANSACTIONS SECTION */}
          {activeSection === 'transactions' && (
            <section className="section">
              <h2>All Transactions</h2>
              {transactions.length > 0 ? (
                <div className="section-box">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{tx.transaction_type}</td>
                          <td>₹{parseFloat(tx.amount).toFixed(2)}</td>
                          <td><span className={`badge badge-${tx.status}`}>{tx.status}</span></td>
                          <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td className="ref-id">{tx.reference_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>📭 No transactions yet</p>
                </div>
              )}
            </section>
          )}

          {/* TRANSFER SECTION */}
          {activeSection === 'transfer' && (
            <section className="section">
              <h2>Transfer Money</h2>
              <div className="section-box">
                <form className="form">
                  <div className="form-group">
                    <label>From Account</label>
                    <select>
                      <option>Select account...</option>
                      {accounts.map(acc => (
                        <option key={acc.id}>{acc.account_number} - {acc.account_type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>To Account Number</label>
                    <input type="text" placeholder="Enter recipient account number" />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input type="number" placeholder="Enter amount" />
                  </div>
                  <button type="submit" className="submit-btn">Transfer Now</button>
                </form>
              </div>
            </section>
          )}

          {/* BILLS SECTION */}
          {activeSection === 'bills' && (
            <section className="section">
              <h2>Pay Bills</h2>
              <div className="bills-grid">
                <div className="bill-card">
                  <h3>📱 Mobile Recharge</h3>
                  <button className="bill-btn">Pay Now →</button>
                </div>
                <div className="bill-card">
                  <h3>⚡ Electricity Bill</h3>
                  <button className="bill-btn">Pay Now →</button>
                </div>
                <div className="bill-card">
                  <h3>🌐 Internet Bill</h3>
                  <button className="bill-btn">Pay Now →</button>
                </div>
              </div>
            </section>
          )}

          {/* CARDS SECTION */}
          {activeSection === 'cards' && (
            <section className="section">
              <h2>Cards & ATM</h2>
              <div className="section-box">
                <p className="empty">💳 No debit cards yet. Contact administrator to issue a card.</p>
              </div>
            </section>
          )}

          {/* LOANS SECTION */}
          {activeSection === 'loans' && (
            <section className="section">
              <h2>Loans</h2>
              <div className="section-box">
                <button className="submit-btn">Apply for Loan →</button>
                <p className="empty" style={{ marginTop: '20px' }}>📊 No active loans</p>
              </div>
            </section>
          )}

          {/* BENEFICIARIES SECTION */}
          {activeSection === 'beneficiaries' && (
            <section className="section">
              <h2>Beneficiaries</h2>
              <div className="section-box">
                <button className="submit-btn">Add Beneficiary →</button>
                <p className="empty" style={{ marginTop: '20px' }}>👥 No beneficiaries added yet</p>
              </div>
            </section>
          )}

          {/* SCHEDULED PAYMENTS SECTION */}
          {activeSection === 'scheduled' && (
            <section className="section">
              <h2>Scheduled Payments</h2>
              <div className="section-box">
                <button className="submit-btn">Schedule Payment →</button>
                <p className="empty" style={{ marginTop: '20px' }}>⏰ No scheduled payments</p>
              </div>
            </section>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeSection === 'notifications' && (
            <section className="section">
              <h2>Notifications</h2>
              <div className="section-box">
                <p className="empty">🔔 No notifications</p>
              </div>
            </section>
          )}

          {/* SETTINGS SECTION */}
          {activeSection === 'settings' && (
            <section className="section">
              <h2>Settings</h2>
              <div className="section-box">
                <div className="setting-item">
                  <h4>Profile Information</h4>
                  <p>Name: {user?.first_name} {user?.last_name}</p>
                  <p>Email: {user?.email}</p>
                  <p>Phone: {user?.phone_number}</p>
                  <p>Role: <span className="badge">{user?.role}</span></p>
                </div>
                <div className="setting-item">
                  <h4>Security</h4>
                  <button className="submit-btn">Change Password →</button>
                </div>
              </div>
            </section>
          )}

          {/* USER MANAGEMENT SECTION (Admin Only) */}
          {activeSection === 'users' && user?.role === 'admin' && (
            <section className="section">
              <div className="section-header">
                <h2>👨‍💼 User Management</h2>
                <button className="submit-btn" onClick={() => setShowCreateUser(true)}>➕ Create User</button>
              </div>

              {showCreateUser && (
                <div className="section-box form-container">
                  <h3>Create New User</h3>
                  <form onSubmit={handleCreateUser} className="form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input type="text" value={userForm.first_name} onChange={(e) => setUserForm({...userForm, first_name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" value={userForm.last_name} onChange={(e) => setUserForm({...userForm, last_name: e.target.value})} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" value={userForm.phone_number} onChange={(e) => setUserForm({...userForm, phone_number: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}>
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input type="password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} required />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Create User</button>
                      <button type="button" className="cancel-btn" onClick={() => setShowCreateUser(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="section-box">
                <h3>All Users ({users.length})</h3>
                {users.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td><strong>{u.username}</strong></td>
                          <td>{u.email}</td>
                          <td>{u.first_name} {u.last_name}</td>
                          <td><span className="badge">{u.role}</span></td>
                          <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-error'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <button className="action-btn-small edit">✏️ Edit</button>
                            <button className="action-btn-small delete" onClick={() => handleDeleteUser(u.id)}>🗑️ Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty">No users found</p>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}

export default DashboardPage;
