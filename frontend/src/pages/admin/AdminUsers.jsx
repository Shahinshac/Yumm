import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Trash2, Edit2, Loader2, Filter, Plus, X, CheckSquare, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorProp, setErrorProp] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '', role: 'customer' });

  const fetchUsers = () => {
    adminService.getAllUsers().then(res => {
      setUsers(res.users || []);
    }).catch(() => {
      setUsers([]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorProp('');
    setIsCreating(true);
    try {
        const res = await adminService.createUser(formData);
        if(res.success) {
            setShowModal(false);
            setFormData({ username: '', email: '', password: '', phone: '', role: 'customer' });
            fetchUsers();
        } else {
            setErrorProp(res.error || 'Failed to create user');
        }
    } catch (err) {
        setErrorProp(err.response?.data?.error || 'Failed to create user. Please check your data.');
    } finally {
        setIsCreating(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete account "${user.full_name || user.username}"? This will also remove their business profile and history.`)) {
        return;
    }

    try {
        const res = await adminService.rejectUser(user.id);
        if (res.success) {
            setUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            alert(res.error || 'Failed to delete user');
        }
    } catch (err) {
        console.error("Delete error:", err);
        alert(err.response?.data?.error || 'Failed to delete user. Please try again.');
    }
  };

  const checkIsOnline = (lastActivityDate) => {
    if (!lastActivityDate) return false;
    const lastActivity = new Date(lastActivityDate);
    const now = new Date();
    return (now - lastActivity) < 5 * 60 * 1000;
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading user directory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all registered accounts across the platform.</p>
        </div>
        <div className="flex gap-3 items-center">
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-400">
              <Users size={16} /> {filteredUsers.length} of {users.length} Users
            </div>
            <button 
                onClick={() => {
                  setLoading(true);
                  fetchUsers();
                }}
                className="p-2 bg-white hover:bg-gray-50 text-gray-400 hover:text-[#ff4b3a] rounded-xl border border-gray-100 transition-all active:rotate-180"
                title="Refresh Directory"
            >
                <RefreshCw size={18} />
            </button>
            <button 
                onClick={() => setShowModal(true)}
                className="bg-[#ff4b3a] hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md shadow-red-100 transition-all flex items-center gap-2"
            >
                <Plus size={16} /> Add User
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-red-500 transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs text-gray-500">
                        {(user.full_name || user.username)?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.full_name || user.username || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-red-100 text-red-600' :
                      user.role === 'restaurant' ? 'bg-orange-100 text-orange-600' :
                      user.role === 'delivery' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {checkIsOnline(user.last_activity) ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Online
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                            Offline
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-blue-500">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-red-500"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Create New User</h2>
                        <p className="text-sm text-gray-500 font-medium">Manually provision an account.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-left">
                    {errorProp && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                            {errorProp}
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Username</label>
                        <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#ff4b3a] focus:bg-white outline-none transition-all" placeholder="Store or delivery alias..." />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Email Address</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#ff4b3a] focus:bg-white outline-none transition-all" placeholder="user@example.com" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                        <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#ff4b3a] focus:bg-white outline-none transition-all" placeholder="10-digit mobile..." />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Password</label>
                        <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#ff4b3a] focus:bg-white outline-none transition-all" placeholder="Secure account password..." />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">System Role</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#ff4b3a] focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                            <option value="customer">Customer</option>
                            <option value="restaurant">Restaurant (Hotel)</option>
                            <option value="delivery">Delivery Partner</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl transition-all">Cancel</button>
                        <button type="submit" disabled={isCreating} className="flex-1 bg-[#ff4b3a] hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isCreating ? <Loader2 size={18} className="animate-spin" /> : <CheckSquare size={18} />}
                            {isCreating ? 'Provisioning...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
