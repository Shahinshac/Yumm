/**
 * Dashboard Page - Main user interface
 * Professional Banking Dashboard
 */
import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/authStore';
import { accountAPI, transactionAPI } from '../services/api';
import '../styles/dashboard.css';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const accountsRes = await accountAPI.getAll();
      console.log('Accounts response:', accountsRes);
      const txRes = await transactionAPI.getAll({ limit: 10 });
      console.log('Transactions response:', txRes);

      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
      setTransactions(Array.isArray(txRes.data?.transactions) ? txRes.data.transactions : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Show error but allow dashboard to render
      setAccounts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
          <small>Connecting to bank accounts...</small>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Welcome, {user?.first_name} 👋</h1>
            <p className="subtitle">Manage your banking operations</p>
          </div>
          <button className="logout-button" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Summary Cards */}
        <section className="summary-section">
          <div className="summary-card total-balance">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <p className="card-label">Total Balance</p>
              <h2 className="card-value">₹{totalBalance.toFixed(2)}</h2>
              <p className="card-meta">{accounts.length} account(s)</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <p className="card-label">Transactions</p>
              <h2 className="card-value">{transactions.length}</h2>
              <p className="card-meta">Recent activities</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <p className="card-label">Accounts</p>
              <h2 className="card-value">{accounts.length}</h2>
              <p className="card-meta">Active accounts</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            📂 Accounts
          </button>
          <button
            className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            💳 Transactions
          </button>
        </div>

        {/* Accounts Section */}
        {activeTab === 'accounts' && (
          <section className="content-section">
            <h2>Your Accounts</h2>
            {accounts.length > 0 ? (
              <div className="accounts-grid">
                {accounts.map((account) => (
                  <div key={account.id} className="account-card">
                    <div className="account-header">
                      <h3>{account.account_type.toUpperCase()}</h3>
                      <span className={`status-badge status-${account.status}`}>
                        {account.status}
                      </span>
                    </div>
                    <div className="account-number">
                      Account: {account.account_number}
                    </div>
                    <div className="account-balance">
                      ₹{parseFloat(account.balance).toFixed(2)}
                    </div>
                    <div className="account-footer">
                      <button className="action-button">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>📭 No accounts found</p>
                <p className="empty-text">Contact your administrator to create an account</p>
              </div>
            )}
          </section>
        )}

        {/* Transactions Section */}
        {activeTab === 'transactions' && (
          <section className="content-section">
            <h2>Recent Transactions</h2>
            {transactions.length > 0 ? (
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <span className="tx-type">{tx.transaction_type}</span>
                        </td>
                        <td>
                          <strong>₹{parseFloat(tx.amount).toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className={`status-badge status-${tx.status}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>📭 No transactions yet</p>
                <p className="empty-text">Start by making a deposit, withdrawal, or transfer</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
