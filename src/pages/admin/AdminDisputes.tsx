import React, { useState } from 'react';
import { AdminLayout } from './AdminOverview';
import { AlertTriangle, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function AdminDisputes() {
  const [tickets, setTickets] = useState([
    { id: 'TKT-104', type: 'Missing Item', customer: 'Alice Smith', restaurant: 'Burger Joint', status: 'open', priority: 'high', date: '2 hours ago' },
    { id: 'TKT-105', type: 'Late Delivery', customer: 'Bob Jones', restaurant: 'Sushi Master', status: 'investigating', priority: 'medium', date: '4 hours ago' },
    { id: 'TKT-106', type: 'Wrong Order', customer: 'Charlie Brown', restaurant: 'Luigi\'s Pizza', status: 'resolved', priority: 'high', date: '1 day ago' },
    { id: 'TKT-107', type: 'Quality Issue', customer: 'Diana Prince', restaurant: 'The Gourmet Kitchen', status: 'open', priority: 'low', date: '5 hours ago' },
  ]);

  const stats = [
    { label: 'Open Tickets', value: tickets.filter(t => t.status === 'open').length, icon: <AlertTriangle className="text-red-500" /> },
    { label: 'Investigating', value: tickets.filter(t => t.status === 'investigating').length, icon: <Clock className="text-orange-500" /> },
    { label: 'Resolved (24h)', value: tickets.filter(t => t.status === 'resolved').length, icon: <CheckCircle className="text-green-500" /> },
  ];

  return (
    <AdminLayout active="disputes">
      <header className="mb-8">
        <h1 className="font-lexend font-black text-3xl tracking-tight text-charcoal">Dispute Center</h1>
        <p className="text-on-surface-variant font-medium mt-1">Customer resolution and support ticket management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="card-premium p-6 flex items-center gap-4">
            <div className="p-4 bg-surface-container rounded-2xl">{stat.icon}</div>
            <div>
              <div className="font-lexend font-black text-3xl text-charcoal">{stat.value}</div>
              <div className="font-bold text-sm text-on-surface-variant uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-premium p-0 overflow-hidden bg-white">
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container/30 flex justify-between items-center">
          <h2 className="font-lexend font-bold text-xl text-charcoal">Active Support Tickets</h2>
          <div className="flex gap-2">
            <button className="btn-secondary py-2 px-4 rounded-xl text-sm">Filter</button>
            <button className="btn-primary py-2 px-4 rounded-xl text-sm">New Ticket</button>
          </div>
        </div>
        
        <div className="divide-y divide-outline-variant/20">
          {tickets.map(ticket => (
            <div key={ticket.id} className="p-6 hover:bg-surface-container/20 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-surface-container rounded-full text-primary">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-on-surface-variant">{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <h3 className="font-lexend font-bold text-lg text-charcoal">{ticket.type}</h3>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">
                    Customer: <span className="text-charcoal">{ticket.customer}</span> • Restaurant: <span className="text-charcoal">{ticket.restaurant}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-bold w-max ${
                  ticket.status === 'open' ? 'bg-red-50 text-red-600 border border-red-200' :
                  ticket.status === 'investigating' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                  'bg-green-50 text-green-600 border border-green-200'
                }`}>
                  {ticket.status.toUpperCase()}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">{ticket.date}</span>
                {ticket.status !== 'resolved' && (
                  <button className="text-primary text-sm font-bold mt-2 hover:underline">Manage Ticket &rarr;</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
