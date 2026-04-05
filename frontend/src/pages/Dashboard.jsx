/**
 * Professional Dashboard - All Features Accessible from One Hub
 * Hamburger Navigation + Responsive Design
 */
import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/authStore';
import { accountAPI, transactionAPI } from '../services/api';
import '../styles/professional-dashboard.css';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setAccounts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  const menuItems = [
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
          <h2>26-07</h2>
          <button
            className="close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
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
          <button className="logout-btn" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>Welcome, {user?.first_name}! 👋</h1>
          <div className="user-info">
            <span className="user-role">{user?.role}</span>
          </div>
        </header>

        {/* Content */}
        <div className="content-area">
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <section className="section">
              <h2>Dashboard Overview</h2>

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
              <h2>Your Accounts</h2>
              {accounts.length > 0 ? (
                <div className="accounts-list">
                  {accounts.map((account) => (
                    <div key={account.id} className="account-item">
                      <div className="account-icon">💳</div>
                      <div className="account-details">
                        <h4>{account.account_type.toUpperCase()}</h4>
                        <p>Account: {account.account_number}</p>
                        <small>Status: {account.status}</small>
                      </div>
                      <div className="account-balance">
                        <p>₹{parseFloat(account.balance).toFixed(2)}</p>
                      </div>
                      <button className="action-btn">View →</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>📭 No accounts found</p>
                  <small>Contact administrator to create an account</small>
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
                  <p>Role: {user?.role}</p>
                </div>
                <div className="setting-item">
                  <h4>Security</h4>
                  <button className="submit-btn">Change Password →</button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default DashboardPage;
