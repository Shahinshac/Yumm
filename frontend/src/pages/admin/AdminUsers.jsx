import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Trash2, Edit2, Loader2, Filter } from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    adminService.getAllUsers().then(res => {
      setUsers(res.users || []);
    }).catch(() => {
      setUsers([]);
    }).finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-400">
          <Users size={16} /> {users.length} Total Users
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
                        {user.full_name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-red-100 text-red-600' :
                      user.role === 'restaurant' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Active
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                    Apr 9, 2026
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-blue-500">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-red-500">
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
    </div>
  );
};

export default AdminUsers;
