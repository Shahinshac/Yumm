import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard, ShoppingCart, ListOrdered, User, LogOut,
  CheckSquare, Menu, X, Bell, ChevronDown, Store, Package, 
  TrendingUp, Settings, MapPin, Star, Wallet, History, Map as MapIcon,
  Mic, Search
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
    { name: 'Fleet Map', path: '/admin/fleet-map', icon: MapIcon },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
};

const Layout = () => {
  const { user, logout: authLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Feature States
  const [vegMode, setVegMode] = useState(false);
  const [locationName, setLocationName] = useState('Detecting Location...');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isCustomer = user?.role === 'customer';
  const links = ROLE_LINKS[user?.role] || [];
  const activeLink = links.find(l => location.pathname.startsWith(l.path));
  const initials = (user?.full_name || user?.username || 'U').slice(0, 2).toUpperCase();

  // Location Geocoding
  useEffect(() => {
    if (isCustomer && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            // Free geocoding via Nominatim
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || 'Current Location';
            setLocationName(city);
          } catch (err) {
            setLocationName('Kadungapuram'); // Fallback as requested in search logic
          }
        },
        () => setLocationName('Kadungapuram')
      );
    }
  }, [isCustomer]);

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
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const logout = () => {
    authLogout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#e23744] rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
            <span className="text-white font-black text-base">Y</span>
          </div>
          <div>
            <span className="text-gray-900 font-black text-lg tracking-tight">Yumm</span>
            <p className="text-[10px] text-gray-400 capitalize leading-none mt-0.5">{user?.role} Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-hide">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150 ${
                isActive ? 'bg-[#e23744] text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-500 rounded-xl transition-all text-sm font-bold">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white text-gray-900 font-sans">
      
      {/* Sidebar - Visible on Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
             <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Dynamic Header */}
        <header className={`bg-white sticky top-0 z-30 transition-all ${isCustomer ? 'pt-2 pb-1' : 'py-3 border-b border-gray-100 px-4 md:px-6'}`}>
          <div className={`${isCustomer ? 'max-w-7xl mx-auto px-4 md:px-6' : 'flex items-center justify-between w-full'}`}>
            
            {isCustomer ? (
              /* ZOMATO CLEAN HEADER (CUSTOMERS) */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <MapPin className="text-[#e23744] fill-[#e23744]/20" size={20} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-base text-gray-900 tracking-tight">{locationName}</span>
                        <ChevronDown size={14} className="text-gray-400 mt-1" />
                      </div>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">India</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <div className="bg-[#f3f4f6] p-1.5 rounded-full cursor-pointer hover:bg-gray-200">
                        <Wallet size={18} className="text-gray-600" />
                     </div>
                     <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-8 h-8 rounded-full bg-[#1c1c1c] flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-xl">
                        {initials}
                     </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center px-3 py-2 gap-2 focus-within:shadow-md transition-shadow">
                     <Search className="text-[#e23744]" size={16} />
                     <input 
                        type="text" 
                        placeholder='Search "comfort food"'
                        className="flex-1 w-full outline-none font-bold text-xs text-gray-800 placeholder-gray-400"
                     />
                     <div className="w-px h-4 bg-gray-100 mx-1" />
                     <Mic className="text-[#e23744]" size={16} />
                  </div>
                  
                  <div className="flex flex-col items-center">
                     <span className="text-[7px] font-black text-gray-400 uppercase mb-0.5">Veg</span>
                     <button 
                        onClick={() => setVegMode(!vegMode)}
                        className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-1 ${vegMode ? 'bg-green-500' : 'bg-gray-200'}`}
                     >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${vegMode ? 'translate-x-5' : 'translate-x-0'}`} />
                     </button>
                  </div>
                </div>
              </div>
            ) : (
              /* OPERATIONAL HEADER (ADMIN/PARTNERS) */
              <>
                <div className="flex items-center gap-4">
                  <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
                    <Menu size={20} />
                  </button>
                  <h1 className="font-black text-xl tracking-tight">{activeLink?.name || 'Operations'}</h1>
                </div>
                <div className="flex items-center gap-3">
                   <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500">
                      <Bell size={20} />
                   </button>
                   <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white font-black text-xs">
                      {initials}
                   </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* User Dropdown Overlay (Simple for now) */}
        {showUserMenu && isCustomer && (
           <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}>
              <div className="absolute right-6 top-32 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-gray-50 mb-2">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account</p>
                     <p className="font-bold text-gray-900 truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl font-bold text-sm">
                     <User size={18} /> Profile
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-500 rounded-2xl font-bold text-sm">
                     <LogOut size={18} /> Sign Out
                  </button>
              </div>
           </div>
        )}

        {/* Page Content */}
        <main className={`flex-1 overflow-auto ${isCustomer ? 'bg-white' : 'p-4 md:p-6 lg:p-8 bg-gray-50'}`}>
          <div className={`${isCustomer ? 'max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6' : 'max-w-7xl mx-auto'}`}>
            <Outlet context={{ vegMode, locationName }} />
          </div>
        </main>

        {/* Mobile Bottom Nav (Visible for customers) */}
        {isCustomer && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-3 flex justify-center w-full z-40 bg-white/80 backdrop-blur-md border-t border-gray-100">
             <div className="flex items-center gap-8">
                <Link to="/home" className={`flex flex-col items-center gap-1 ${location.pathname === '/home' ? 'text-[#e23744]' : 'text-gray-400'}`}>
                   <LayoutDashboard size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Delivery</span>
                </Link>
                <Link to="/orders" className={`flex flex-col items-center gap-1 ${location.pathname === '/orders' ? 'text-[#e23744]' : 'text-gray-400'}`}>
                   <History size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                </Link>
                <Link to="/cart" className={`flex flex-col items-center gap-1 ${location.pathname === '/cart' ? 'text-[#e23744]' : 'text-gray-400'}`}>
                   <ShoppingCart size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Cart</span>
                </Link>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
