import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard, ShoppingCart, ListOrdered, User, LogOut,
  CheckSquare, Menu, X, Bell, ChevronDown, Store, Package, 
  TrendingUp, Settings, MapPin, Star, Wallet, History
} from 'lucide-react';

const ROLE_LINKS = {
  customer: [
    { name: 'Home', path: '/home', icon: LayoutDashboard },
    { name: 'Cart', path: '/cart', icon: ShoppingCart },
    { name: 'My Orders', path: '/orders', icon: ListOrdered },
    { name: 'Addresses', path: '/profile/addresses', icon: MapPin },
    { name: 'My Reviews', path: '/customer/reviews', icon: Star },
    { name: 'Profile', path: '/profile', icon: User },
  ],
  restaurant: [
    { name: 'Dashboard', path: '/restaurant/dashboard', icon: LayoutDashboard },
    { name: 'Menu', path: '/restaurant/menu', icon: ListOrdered },
    { name: 'Orders', path: '/restaurant/orders', icon: CheckSquare },
    { name: 'Analytics', path: '/restaurant/analytics', icon: TrendingUp },
    { name: 'Reviews', path: '/restaurant/reviews', icon: Star },
    { name: 'Settings', path: '/restaurant/settings', icon: Settings },
  ],
  delivery: [
    { name: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
    { name: 'My Deliveries', path: '/delivery/orders', icon: CheckSquare },
    { name: 'Earnings', path: '/delivery/earnings', icon: Wallet },
    { name: 'History', path: '/delivery/history', icon: History },
  ],
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Approvals', path: '/admin/approvals', icon: CheckSquare },
    { name: 'Restaurants', path: '/admin/restaurants', icon: Store },
    { name: 'Platform Orders', path: '/admin/orders', icon: Package },
    { name: 'Users', path: '/admin/users', icon: User },
    { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
};

const ROLE_COLORS = {
  customer: 'bg-blue-100 text-blue-700',
  restaurant: 'bg-orange-100 text-orange-700',
  delivery: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-600',
};

const Layout = () => {
  const { user, logout: authLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const links = ROLE_LINKS[user?.role] || [];
  const activeLink = links.find(l => location.pathname.startsWith(l.path));
  const initials = (user?.full_name || user?.username || 'U').slice(0, 2).toUpperCase();

  // Load notifications
  useEffect(() => {
    if (user) {
      const fetchNotifs = () => {
        api.get('/notifications').then(res => {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unread_count || 0);
        }).catch(() => {});
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000); // Polling every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const logout = () => {
    authLogout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#ff4b3a] rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
            <span className="text-white font-black text-base">Y</span>
          </div>
          <div>
            <span className="text-gray-900 font-black text-lg tracking-tight">Yumm</span>
            <p className="text-[10px] text-gray-400 capitalize leading-none mt-0.5">{user?.role} Portal</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-hide">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#ff4b3a] text-white shadow-lg shadow-red-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {link.name}
              {isActive && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* User card + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-150 text-sm font-bold"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-in slide-in-from-left duration-300">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100">
              <X size={20} className="text-gray-600" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 lg:hidden">
              <Menu size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-base">
                {activeLink?.name || 'Dashboard'}
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hidden sm:block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className={`relative p-2.5 rounded-xl transition ${showNotifications ? 'bg-gray-100 text-[#ff4b3a]' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-4 h-4 bg-[#ff4b3a] text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <span className="text-[10px] font-black bg-red-50 text-[#ff4b3a] px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <p className="text-gray-400 text-xs font-medium">No alerts yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <button 
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition border-b border-gray-50 last:border-0 flex gap-3 ${!n.is_read ? 'bg-red-50/30' : ''}`}
                        >
                          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.is_read ? 'bg-gray-200' : 'bg-[#ff4b3a]'}`} />
                          <div>
                            <p className="font-bold text-xs text-gray-900">{n.title}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar / User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="flex items-center gap-2.5 pl-3 border-l border-gray-200 hover:opacity-80 transition"
              >
                <div className="w-8 h-8 bg-[#ff4b3a] rounded-full flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-100">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none">{user?.full_name?.split(' ')[0] || user?.username}</p>
                  <p className="text-[10px] text-gray-400 font-bold capitalize mt-0.5">{user?.role}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Signed in as</p>
                    <p className="text-sm font-bold text-gray-900 mt-1 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#ff4b3a] rounded-xl transition">
                      <User size={16} /> My Account
                    </Link>
                    <Link to={user?.role === 'admin' ? '/admin/settings' : '/profile/settings'} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#ff4b3a] rounded-xl transition">
                      <Settings size={16} /> Settings
                    </Link>
                    <div className="my-1 border-t border-gray-50" />
                    <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition">
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-[#fcfcfc]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
