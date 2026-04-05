import { useEffect, useState } from 'react';
import { useAuthStore } from '../context/authStore';
import { accountAPI, transactionAPI } from '../services/api';
import '../styles/dashboard.css';

export default function CustomerDashboard() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accRes, txnRes] = await Promise.all([
        accountAPI.getAll(),
        transactionAPI.getAll({ limit: 10 })
      ]);
      setAccounts(accRes.data.accounts || []);
      setTransactions(txnRes.data.transactions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.first_name}! 👋</h1>
        <button onClick={() => { logout(); window.location.href = '/login'; }}>
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        {/* Accounts Section */}
        <section className="section">
          <h2>💳 Your Accounts</h2>
          {accounts.length === 0 ? (
            <p>No accounts yet</p>
          ) : (
            <div className="accounts-grid">
              {accounts.map((acc) => (
                <div key={acc.id} className="account-card">
                  <h3>{acc.account_type.toUpperCase()}</h3>
                  <p className="account-number">{acc.account_number}</p>
                  <p className="balance">₹{acc.balance.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Transactions Section */}
        <section className="section">
          <h2>📊 Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p>No transactions</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.type}</td>
                    <td>₹{txn.amount}</td>
                    <td>{txn.status}</td>
                    <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
