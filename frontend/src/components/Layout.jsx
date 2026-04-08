import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ShoppingCart, ListOrdered, User, LogOut,
  CheckSquare, Menu, X, Bell, ChevronDown
} from 'lucide-react';

const ROLE_LINKS = {
  customer: [
    { name: 'Home', path: '/home', icon: LayoutDashboard },
    { name: 'Cart', path: '/cart', icon: ShoppingCart },
    { name: 'My Orders', path: '/orders', icon: ListOrdered },
    { name: 'Profile', path: '/profile', icon: User },
  ],
  restaurant: [
    { name: 'Dashboard', path: '/restaurant/dashboard', icon: LayoutDashboard },
    { name: 'Menu', path: '/restaurant/menu', icon: ListOrdered },
    { name: 'Orders', path: '/restaurant/orders', icon: CheckSquare },
  ],
  delivery: [
    { name: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
    { name: 'My Deliveries', path: '/delivery/orders', icon: CheckSquare },
  ],
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Approvals', path: '/admin/approvals', icon: CheckSquare },
    { name: 'Users', path: '/admin/users', icon: User },
  ],
};

const ROLE_COLORS = {
  customer: 'bg-blue-100 text-blue-700',
  restaurant: 'bg-orange-100 text-orange-700',
  delivery: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-600',
};

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = ROLE_LINKS[user?.role] || [];
  const activeLink = links.find(l => location.pathname.startsWith(l.path));
  const initials = (user?.full_name || user?.username || 'U').slice(0, 2).toUpperCase();

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
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
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
        <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl mb-2">
          <div className="w-8 h-8 bg-[#ff4b3a] rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-xs truncate">{user?.full_name || user?.username}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[user?.role]}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-150 text-sm font-medium"
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
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
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 lg:hidden">
              <Menu size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-base">
                {activeLink?.name || 'Dashboard'}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <Bell size={19} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff4b3a] rounded-full" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-[#ff4b3a] rounded-full flex items-center justify-center text-white font-bold text-xs">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.full_name?.split(' ')[0] || user?.username}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
