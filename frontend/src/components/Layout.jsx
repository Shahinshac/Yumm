import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, ListOrdered, User, LogOut, CheckSquare } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getRoleLinks = () => {
    switch (user?.role) {
      case 'customer':
        return [
          { name: 'Home', path: '/home', icon: LayoutDashboard },
          { name: 'Cart', path: '/cart', icon: ShoppingCart },
          { name: 'Orders', path: '/orders', icon: ListOrdered },
          { name: 'Profile', path: '/profile', icon: User },
        ];
      case 'restaurant':
        return [
          { name: 'Dashboard', path: '/restaurant/dashboard', icon: LayoutDashboard },
          { name: 'Menu', path: '/restaurant/menu', icon: ListOrdered },
          { name: 'Orders', path: '/restaurant/orders', icon: CheckSquare },
        ];
      case 'delivery':
        return [
          { name: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
          { name: 'My Deliveries', path: '/delivery/orders', icon: CheckSquare },
        ];
      case 'admin':
        return [
          { name: 'Admin Hub', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Approvals', path: '/admin/approvals', icon: CheckSquare },
          { name: 'Users', path: '/admin/users', icon: User },
        ];
      default:
        return [];
    }
  };

  const links = getRoleLinks();

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#ff4b3a]">FoodHub</h2>
          <p className="text-xs text-gray-500 capitalize">{user?.role} Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                  isActive 
                    ? 'bg-[#ff4b3a] text-white' 
                    : 'text-gray-600 hover:bg-orange-50 hover:text-[#ff4b3a]'
                }`}
              >
                <Icon size={20} />
                {link.name}
            </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:text-red-500 transition font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">
            {links.find(l => location.pathname.startsWith(l.path))?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 text-[#ff4b3a] rounded-full flex items-center justify-center font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
