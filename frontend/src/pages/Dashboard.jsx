/**
 * Dashboard Page - Main user interface
 */
import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/authStore';
import { accountAPI, transactionAPI } from '../services/api';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
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
      setAccounts(accountsRes.data);
      setTransactions(txRes.data.transactions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user?.first_name}!</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <section className="accounts">
        <h2>Your Accounts</h2>
        {accounts.length > 0 ? (
          <div className="accounts-grid">
            {accounts.map((account) => (
              <div key={account.id} className="account-card">
                <h3>{account.account_type}</h3>
                <p className="account-number">{account.account_number}</p>
                <p className="balance">₹ {account.balance.toFixed(2)}</p>
                <p className="status">{account.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No accounts found</p>
        )}
      </section>

      <section className="transactions">
        <h2>Recent Transactions</h2>
        {transactions.length > 0 ? (
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
                  <td>{tx.transaction_type}</td>
                  <td>₹ {tx.amount.toFixed(2)}</td>
                  <td>{tx.status}</td>
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions found</p>
        )}
      </section>
    </div>
  );
}
