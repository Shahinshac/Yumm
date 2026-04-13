import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
    Check, X, Clock, User, Store, Bike, Search, 
    Filter, MoreHorizontal, ArrowRight, ShieldCheck, Mail, Phone
} from 'lucide-react';

const AdminApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastApproved, setLastApproved] = useState(null); // { id, password }

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingUsers();
      setUsers(data.pending_users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const resp = await adminService.approveUser(id);
      setLastApproved({ id, password: resp.password });
      // Remove from list after 10 seconds to give subagent time to read
      setTimeout(() => {
        setUsers(prev => prev.filter(u => u.id !== id));
      }, 10000);
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e23744] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Scanning for new applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="relative z-10">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                 <ShieldCheck className="text-[#e23744]" size={32} /> Approval Desk
              </h2>
              <p className="text-gray-400 text-sm font-bold mt-1">Manage restaurant and rider applications for the Yumm network.</p>
          </div>
          
          <div className="flex bg-gray-50 p-2 rounded-2xl relative z-10">
             <div className="px-6 py-2 border-r border-gray-100 text-center">
                <p className="text-xl font-black text-gray-900">{users.length}</p>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Awaiting Review</p>
             </div>
             <div className="px-6 py-2 text-center">
                <p className="text-xl font-black text-[#e23744]">48h</p>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Avg Review Time</p>
             </div>
          </div>

          {/* Decorative subtle background icon */}
          <ShieldCheck className="absolute -right-8 -bottom-8 text-gray-50 w-48 h-48 -rotate-12 z-0" />
      </div>

      {/* Main Filter & Table Area */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                    type="text" 
                    placeholder="Search by name, email or shop..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-red-50 transition-all"
                />
            </div>
            <button className="px-5 py-3 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition">
                <Filter size={14} /> Filter Results
            </button>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-gray-200" size={32} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Queue is Clear</h3>
            <p className="text-xs text-gray-400 mt-1">All partner applications have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[9px] font-black uppercase tracking-[0.15em]">
                  <th className="px-8 py-5">Partner Identity</th>
                  <th className="px-8 py-5">Role & Category</th>
                  <th className="px-8 py-5">Contact Details & KYC</th>
                  <th className="px-8 py-5 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-900 font-black relative overflow-hidden group-hover:border-[#e23744]/20 transition-all">
                                {u.role === 'restaurant' ? <Store size={20} className="text-orange-500" /> : <Bike size={20} className="text-blue-500" />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 leading-tight">
                                    {u.full_name || u.name || u.username}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold mt-1">Registered: {new Date(u.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                            <span className={`w-fit px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                u.role === 'restaurant' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                                {u.role}
                            </span>
                            {u.role === 'restaurant' && (
                                <p className="text-[11px] font-bold text-gray-600 italic">"{u.shop_name || 'Individual Merchant'}"</p>
                            )}
                        </div>
                    </td>
                    <td className="px-8 py-6">
                         <div className="space-y-2">
                             <p className="text-xs font-bold text-gray-700 flex items-center gap-2"><Mail size={12} className="text-gray-300" /> {u.email}</p>
                             <p className="text-xs font-bold text-gray-500 flex items-center gap-2"><Phone size={12} className="text-gray-300" /> {u.phone || 'No phone'}</p>
                             {u.id_proof_url && (
                                <a 
                                  href={u.id_proof_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg hover:bg-green-100 transition"
                                >
                                  <ShieldCheck size={12} /> View ID Proof
                                </a>
                             )}
                         </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                        {lastApproved?.id === u.id ? (
                           <div className="bg-green-50 p-3 rounded-xl border border-green-200 animate-pulse">
                              <p className="text-[10px] font-black text-green-700 uppercase">PROVISIONAL PASSWORD</p>
                              <p className="text-sm font-black text-gray-900 select-all" id={`password_${u.id}`}>{lastApproved.password}</p>
                           </div>
                        ) : (
                          <div className="flex justify-end items-center gap-3 transition-all duration-300">
                             <button 
                               onClick={() => handleReject(u.id)}
                               className="p-3 bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-2xl border border-gray-100 shadow-sm transition-all"
                               title="Deny Access"
                             >
                               <X size={18} />
                             </button>
                             <button 
                               onClick={() => handleApprove(u.id)}
                               className="px-6 py-3 bg-[#e23744] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-100 hover:bg-black hover:shadow-black/10 transition-all active:scale-95"
                               id={`approve_${u.id}`}
                             >
                               <Check size={16} /> Approve Partner
                             </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manual background verification is recommended</p>
            <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#e23744] transition shadow-sm"><MoreHorizontal size={14}/></button>
                <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-900 uppercase tracking-widest hover:bg-white transition flex items-center gap-2 shadow-sm">
                    Next Page <ArrowRight size={12} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovals;
