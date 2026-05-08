import React from 'react';
import { AdminLayout } from './AdminOverview';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, Wallet } from 'lucide-react';

export default function AdminFinancials() {
  const stats = [
    { label: 'Total Revenue', value: '$124,592.00', trend: '+14.5%', positive: true, icon: <DollarSign /> },
    { label: 'Platform Commission', value: '$18,688.80', trend: '+14.5%', positive: true, icon: <TrendingUp /> },
    { label: 'Pending Payouts', value: '$42,100.50', trend: '-2.4%', positive: false, icon: <Wallet /> },
    { label: 'Active Subscriptions', value: '142', trend: '+12', positive: true, icon: <CreditCard /> },
  ];

  const transactions = [
    { id: 'TRX-9921', to: 'The Gourmet Kitchen', amount: 4250.00, status: 'Completed', date: '2023-10-25 14:30' },
    { id: 'TRX-9922', to: 'Sushi Master', amount: 1840.50, status: 'Processing', date: '2023-10-25 15:45' },
    { id: 'TRX-9923', to: 'Luigi\'s Pizza', amount: 3100.00, status: 'Completed', date: '2023-10-26 09:15' },
    { id: 'TRX-9924', to: 'Burger Joint', amount: 890.25, status: 'Failed', date: '2023-10-26 11:20' },
    { id: 'TRX-9925', to: 'Vegan Delight', amount: 2150.75, status: 'Processing', date: '2023-10-26 13:10' },
  ];

  return (
    <AdminLayout active="financials">
      <header className="mb-8">
        <h1 className="font-lexend font-black text-3xl tracking-tight text-charcoal">Financial Operations</h1>
        <p className="text-on-surface-variant font-medium mt-1">Enterprise revenue and payout management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="card-premium p-6">
            <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
              <div className="p-2 bg-surface-container rounded-xl text-primary">{stat.icon}</div>
              <span className="font-bold text-sm uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="font-lexend font-black text-3xl text-charcoal mb-2">{stat.value}</div>
            <div className={`flex items-center gap-1 text-sm font-bold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
              {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {stat.trend} from last month
            </div>
          </div>
        ))}
      </div>

      <div className="card-premium p-0 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/30">
          <h2 className="font-lexend font-bold text-xl text-charcoal">Recent Payouts</h2>
          <button className="btn-secondary py-2 px-4 rounded-xl text-sm">Download CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50 text-on-surface-variant text-xs uppercase tracking-wider font-bold">
                <th className="p-4 border-b border-outline-variant/30">Transaction ID</th>
                <th className="p-4 border-b border-outline-variant/30">Recipient</th>
                <th className="p-4 border-b border-outline-variant/30">Date</th>
                <th className="p-4 border-b border-outline-variant/30">Amount</th>
                <th className="p-4 border-b border-outline-variant/30">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((trx, i) => (
                <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container/20 transition-colors">
                  <td className="p-4 font-mono text-sm text-charcoal font-medium">{trx.id}</td>
                  <td className="p-4 font-bold text-sm text-charcoal">{trx.to}</td>
                  <td className="p-4 text-sm text-on-surface-variant">{trx.date}</td>
                  <td className="p-4 font-lexend font-bold text-charcoal">${trx.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      trx.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      trx.status === 'Processing' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
