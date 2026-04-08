import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Users, Store, Bike, ShoppingBag, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, ChevronRight, Activity,
  Package, Star, DollarSign
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
    <div className={`${bg} p-3 rounded-xl`}>
      <Icon size={22} className={color} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Load stats
    api.get('/admin/stats').then(res => {
      setStats(res.data);
    }).catch(() => {
      // Fallback mock stats
      setStats({
        total_users: 24,
        total_restaurants: 8,
        total_deliveries: 12,
        pending_approvals: 3,
        total_orders: 156,
        revenue: 48200,
      });
    }).finally(() => setLoadingStats(false));

    // Load pending approvals preview
    api.get('/admin/pending-users').then(res => {
      setPending((res.data.pending_users || []).slice(0, 4));
    }).catch(() => {
      setPending([]);
    });
  }, []);

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats?.total_users ?? '—',
      sub: 'Registered accounts',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Store,
      label: 'Restaurants',
      value: stats?.total_restaurants ?? '—',
      sub: 'Active partners',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: Bike,
      label: 'Delivery Partners',
      value: stats?.total_deliveries ?? '—',
      sub: 'On the road',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: AlertCircle,
      label: 'Pending Approvals',
      value: stats?.pending_approvals ?? pending.length,
      sub: 'Awaiting review',
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ];

  const recentActivity = [
    { icon: CheckCircle, text: 'Approved Pizza Palace restaurant', time: '2 min ago', color: 'text-green-500' },
    { icon: Users, text: 'New delivery partner registered', time: '14 min ago', color: 'text-blue-500' },
    { icon: ShoppingBag, text: 'Order #1042 completed', time: '30 min ago', color: 'text-orange-500' },
    { icon: XCircle, text: 'Rejected partner application', time: '1 hr ago', color: 'text-red-500' },
    { icon: Store, text: 'New restaurant onboarded', time: '3 hrs ago', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.full_name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening across Yumm today.</p>
        </div>
        <Link
          to="/admin/approvals"
          className="inline-flex items-center gap-2 bg-[#ff4b3a] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e03d2e] transition-colors shadow-lg shadow-red-100"
        >
          Review Approvals
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loadingStats
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-28" />
            ))
          : statCards.map(card => <StatCard key={card.label} {...card} />)
        }
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Pending Approvals */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              <h2 className="font-bold text-gray-800">Pending Approvals</h2>
            </div>
            <Link to="/admin/approvals" className="text-[#ff4b3a] text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle size={40} className="mb-3 text-green-300" />
              <p className="font-medium">All clear! No pending approvals.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pending.map(u => (
                <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${u.role === 'restaurant' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {(u.full_name || u.name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{u.full_name || u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase shrink-0 ${u.role === 'restaurant' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {u.role}
                  </span>
                  <Link to="/admin/approvals" className="shrink-0 text-xs text-[#ff4b3a] hover:underline font-medium">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
            <Activity size={18} className="text-purple-500" />
            <h2 className="font-bold text-gray-800">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-6 py-4">
                <item.icon size={16} className={`${item.color} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Package size={18} className="text-gray-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/admin/approvals', icon: CheckCircle, label: 'Approve Users', color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100' },
            { to: '/admin/restaurants', icon: Store, label: 'Manage Restaurants', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' },
            { to: '/admin/orders', icon: ShoppingBag, label: 'View Orders', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
            { to: '/admin/analytics', icon: TrendingUp, label: 'Analytics', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100' },
          ].map(action => (
            <Link
              key={action.label}
              to={action.to}
              className={`${action.bg} rounded-xl p-4 flex flex-col items-center gap-2 transition-colors cursor-pointer group`}
            >
              <action.icon size={24} className={`${action.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-semibold text-gray-700 text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
