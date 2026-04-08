import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Check, X, Clock } from 'lucide-react';

const AdminApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
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
      alert(`User approved! Their generated password is: ${resp.password}\n\nNote: ${resp.note || 'Share this via email/phone.'}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Error approving user');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Error rejecting user');
    }
  };

  if (loading) return <div>Loading pending approvals...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock className="text-orange-500" /> Pending Approvals
      </h2>
      
      {users.length === 0 ? (
        <p className="text-gray-500">No pending users right now.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50/50">
                  <td className="p-3 font-medium">{u.full_name || u.name}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'restaurant' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{u.phone}</td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleApprove(u.id)}
                      className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => handleReject(u.id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      title="Reject"
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
