/**
 * Professional Dashboard - Complete Admin & User Management
 * Hamburger Navigation + Full CRUD Operations + Auto-Generated Passwords
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../context/authStore';
import { accountAPI, transactionAPI, userAPI, authAPI } from '../services/api';
import { generatePassword, copyToClipboard, validateEmail, validatePhone } from '../utils/helpers';
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
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [accountForm, setAccountForm] = useState({
    account_type: 'savings',
    initial_balance: 0,
  });

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'customer',
  });

  // Billing states
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [bills, setBills] = useState([]);
  const [billPayments, setBillPayments] = useState([]);
  const [billForm, setBillForm] = useState({
    bill_id: `BILL-${Date.now()}`,
    bill_type: 'mobile_recharge',
    amount: '',
    recipient_name: '',
    recipient_identifier: '',
    customer_id: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

    // Validate inputs
    if (!validateEmail(userForm.email)) {
      alert('Invalid email address');
      return;
    }
    if (!validatePhone(userForm.phone_number)) {
      alert('Invalid phone number');
      return;
    }

    // Auto-generate password
    const tempPassword = generatedPassword || generatePassword();

    try {
      const response = await authAPI.register({
        ...userForm,
        password: tempPassword,
      });
      if (response.status === 201) {
        alert(`✅ User created successfully!\n\nUsername: ${userForm.username}\nPassword: ${tempPassword}\n\nPlease save the password securely.`);
        setShowCreateUser(false);
        setGeneratedPassword('');
        setUserForm({
          username: '',
          email: '',
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

  // Billing handlers for admin
  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!billForm.customer_id || !billForm.amount || !billForm.recipient_identifier) {
      alert('Please fill all required fields');
      return;
    }
    try {
      // Create dummy bill locally for demo
      const newBill = {
        id: `BILL-${Date.now()}`,
        ...billForm,
        amount: parseFloat(billForm.amount),
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setBills([newBill, ...bills]);
      alert('✅ Bill created successfully!');
      setBillForm({
        bill_id: `BILL-${Date.now()}`,
        bill_type: 'mobile_recharge',
        amount: '',
        recipient_name: '',
        recipient_identifier: '',
        customer_id: '',
        description: '',
      });
      setShowBillingForm(false);
    } catch (error) {
      alert('Failed to create bill: ' + error.message);
    }
  };

  const handlePayBill = async (billId) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    if (!window.confirm(`Pay ₹${bill.amount} for ${bill.bill_type}?`)) return;

    try {
      // Mark bill as paid locally
      setBills(bills.map(b =>
        b.id === billId
          ? { ...b, status: 'success' }
          : b
      ));

      // Add to payment history
      setBillPayments([{
        payment_id: `PAY-${Date.now()}`,
        bill_id: billId,
        ...bill,
        status: 'success',
        paid_at: new Date().toISOString(),
      }, ...billPayments]);

      alert('✅ Bill paid successfully!');
    } catch (error) {
      alert('Failed to pay bill: ' + error.message);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  // Menu items with icons - FIX: Use useMemo to prevent duplication
  const menuItems = useMemo(() => {
    const baseItems = [
      { id: 'overview', label: '📊 Overview', icon: '📊' },
      { id: 'accounts', label: '💳 Accounts', icon: '💳' },
      { id: 'transactions', label: '📝 Transactions', icon: '📝' },
      { id: 'transfer', label: '💸 Transfer Money', icon: '💸' },
      { id: 'bills', label: '📱 Pay Bills', icon: '📱' },
      { id: 'cards', label: '🎫 Cards & ATM', icon: '🎫' },
      { id: 'loans', label: '📊 Loans', icon: '📊' },
      { id: 'beneficiaries', label: '👥 Beneficiaries', icon: '👥' },
      { id: 'scheduled', label: '⏰ Scheduled Payments', icon: '⏰' },
      { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
      { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
    ];

    // Add admin menu only once using useMemo
    if (user?.role === 'admin') {
      baseItems.push(
        { id: 'users', label: '👨‍💼 User Management', icon: '👨‍💼' },
        { id: 'billing', label: '💰 Billing Management', icon: '💰' }
      );
    }

    return baseItems;
  }, [user?.role]);

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
              <span className="menu-icon">{item.icon}</span>
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
                <button className="submit-btn" onClick={() => {
                  setGeneratedPassword(generatePassword());
                  setShowCreateUser(true);
                }}>➕ Create User</button>
              </div>

              {showCreateUser && (
                <div className="section-box form-container">
                  <h3>Create New User</h3>
                  <form onSubmit={handleCreateUser} className="form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input type="text" value={userForm.first_name} onChange={(e) => setUserForm({...userForm, first_name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input type="text" value={userForm.last_name} onChange={(e) => setUserForm({...userForm, last_name: e.target.value})} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Username *</label>
                        <input type="text" value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" value={userForm.phone_number} onChange={(e) => setUserForm({...userForm, phone_number: e.target.value})} placeholder="+91-1234567890" required />
                      </div>
                      <div className="form-group">
                        <label>Role *</label>
                        <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}>
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    {/* Auto Generated Password Display */}
                    <div className="section-box password-display">
                      <h4>🔐 Auto-Generated Password</h4>
                      <div className="password-field">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={generatedPassword}
                          readOnly
                          className="password-input"
                        />
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                        <button
                          type="button"
                          className="icon-btn copy-btn"
                          onClick={() => {
                            copyToClipboard(generatedPassword);
                            alert('Password copied to clipboard!');
                          }}
                          title="Copy password"
                        >
                          📋
                        </button>
                      </div>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => setGeneratedPassword(generatePassword())}
                      >
                        🔄 Regenerate Password
                      </button>
                      <p className="hint">💡 Share this password securely with the user. They can change it after first login.</p>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Create User</button>
                      <button type="button" className="cancel-btn" onClick={() => {
                        setShowCreateUser(false);
                        setGeneratedPassword('');
                      }}>Cancel</button>
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
                        <th>Phone</th>
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
                          <td>{u.phone_number}</td>
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

          {/* BILLING MANAGEMENT SECTION - ADMIN ONLY */}
          {activeSection === 'billing' && user?.role === 'admin' && (
            <section className="section">
              <div className="section-header">
                <h2>💰 Billing Management</h2>
                <button className="submit-btn" onClick={() => setShowBillingForm(!showBillingForm)}>
                  {showBillingForm ? '✕ Cancel' : '➕ Create Bill'}
                </button>
              </div>

              {/* Create Bill Form */}
              {showBillingForm && (
                <div className="section-box form-container">
                  <h3>Create New Bill</h3>
                  <form onSubmit={handleCreateBill} className="form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Bill ID (Auto)</label>
                        <input type="text" value={billForm.bill_id} disabled className="disabled-field" />
                      </div>
                      <div className="form-group">
                        <label>Bill Type *</label>
                        <select value={billForm.bill_type} onChange={(e) => setBillForm({...billForm, bill_type: e.target.value})}>
                          <option value="mobile_recharge">📱 Mobile Recharge</option>
                          <option value="electricity">⚡ Electricity Bill</option>
                          <option value="internet">🌐 Internet Bill</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Amount (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={billForm.amount}
                          onChange={(e) => setBillForm({...billForm, amount: e.target.value})}
                          placeholder="Enter amount"
                        />
                      </div>
                      <div className="form-group">
                        <label>Customer (User ID) *</label>
                        <select
                          value={billForm.customer_id}
                          onChange={(e) => setBillForm({...billForm, customer_id: e.target.value})}
                        >
                          <option value="">Select customer...</option>
                          {users.filter(u => u.role === 'customer').map(u => (
                            <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.username})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Recipient Name *</label>
                        <input
                          type="text"
                          value={billForm.recipient_name}
                          onChange={(e) => setBillForm({...billForm, recipient_name: e.target.value})}
                          placeholder="e.g., Jio, BCCL, Airtel"
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          {billForm.bill_type === 'mobile_recharge' ? 'Phone Number' : 'Account Number'} *
                        </label>
                        <input
                          type="text"
                          value={billForm.recipient_identifier}
                          onChange={(e) => setBillForm({...billForm, recipient_identifier: e.target.value})}
                          placeholder={billForm.bill_type === 'mobile_recharge' ? '+91-9876543210' : '12345678'}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={billForm.description}
                        onChange={(e) => setBillForm({...billForm, description: e.target.value})}
                        placeholder="Optional notes"
                        rows="2"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Create Bill</button>
                      <button type="button" className="cancel-btn" onClick={() => setShowBillingForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Bills Grid */}
              <div className="section-box">
                <h3>Pending Bills ({bills.filter(b => b.status === 'pending').length})</h3>
                {bills.filter(b => b.status === 'pending').length > 0 ? (
                  <div className="bills-grid">
                    {bills.filter(b => b.status === 'pending').map((bill) => (
                      <div key={bill.id} className="bill-card">
                        <div className="bill-header">
                          <span className="bill-id">ID: {bill.bill_id}</span>
                          <span className={`badge badge-${bill.status}`}>{bill.status.toUpperCase()}</span>
                        </div>
                        <div className="bill-details">
                          <p><strong>{bill.bill_type.replace('_', ' ').toUpperCase()}</strong></p>
                          <p>📋 {bill.recipient_name} - {bill.recipient_identifier}</p>
                          <p>💵 Amount: <strong>₹{parseFloat(bill.amount).toFixed(2)}</strong></p>
                          <p className="date">{new Date(bill.created_at).toLocaleDateString()}</p>
                        </div>
                        <button
                          className="pay-btn"
                          onClick={() => handlePayBill(bill.id)}
                        >
                          ✓ Pay Bill
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty">No pending bills</p>
                )}
              </div>

              {/* Paid Bills */}
              <div className="section-box">
                <h3>Payment History ({billPayments.length})</h3>
                {billPayments.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Bill Type</th>
                        <th>Amount</th>
                        <th>Recipient</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billPayments.map((payment) => (
                        <tr key={payment.payment_id}>
                          <td><strong>{payment.payment_id}</strong></td>
                          <td>{payment.bill_type}</td>
                          <td>₹{payment.amount.toFixed(2)}</td>
                          <td>{payment.recipient_name}</td>
                          <td><span className="badge badge-success">✓ PAID</span></td>
                          <td>{new Date(payment.paid_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty">No payment history</p>
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
