import React, { useState } from 'react';
import { AdminLayout } from './AdminOverview';
import { useApp } from '../../context/AppContext';
import type { PendingOwner, PendingPartner } from '../../types';

type Tab = 'owners' | 'partners';

export default function AdminApprovals() {
  const { pendingOwners, pendingPartners, approveOwner, rejectOwner, approvePartner, rejectPartner } = useApp();
  const [tab, setTab] = useState<Tab>('owners');

  const pendingOCount = pendingOwners.filter(o => o.status === 'pending').length;
  const pendingPCount = pendingPartners.filter(p => p.status === 'pending').length;

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="badge-green">Approved</span>;
    if (status === 'rejected') return <span className="badge-red">Rejected</span>;
    return <span className="badge-orange">Pending Review</span>;
  };

  return (
    <AdminLayout active="approvals">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-lexend font-bold text-3xl text-on-surface">Approval Queue</h1>
          <p className="text-on-surface-variant mt-1">
            {pendingOCount + pendingPCount} application{pendingOCount + pendingPCount !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab('owners')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${tab === 'owners' ? 'chip-active' : 'chip-inactive'}`}>
          🧑‍🍳 Restaurant Owners
          {pendingOCount > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === 'owners' ? 'bg-white/30 text-white' : 'bg-primary text-white'}`}>
              {pendingOCount}
            </span>
          )}
        </button>
        <button onClick={() => setTab('partners')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${tab === 'partners' ? 'chip-active' : 'chip-inactive'}`}>
          🛵 Delivery Partners
          {pendingPCount > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === 'partners' ? 'bg-white/30 text-white' : 'bg-primary text-white'}`}>
              {pendingPCount}
            </span>
          )}
        </button>
      </div>

      {/* Owner applications */}
      {tab === 'owners' && (
        <div className="space-y-4">
          {pendingOwners.length === 0 ? (
            <Empty label="No restaurant applications yet" />
          ) : (
            pendingOwners.map(owner => (
              <div key={owner.id} className="glass-1 rounded-3xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-[20px] flex items-center justify-center text-3xl shadow-inner">🧑‍🍳</div>
                    <div>
                      <p className="font-lexend font-black text-xl text-on-surface leading-tight">{owner.restaurantName}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-0.5">{owner.cuisineType || 'Luxury Dining'}</p>
                    </div>
                  </div>
                  {statusBadge(owner.status)}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-5 bg-surface-container rounded-2xl p-4">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Owner Name</p>
                    <p className="font-semibold mt-1 text-on-surface">{owner.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Email</p>
                    <p className="font-semibold mt-1 text-on-surface truncate">{owner.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Phone</p>
                    <p className="font-semibold mt-1 text-on-surface">{owner.phone}</p>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant mb-4">
                  Applied: {owner.registeredAt.toLocaleString()}
                </p>

                {owner.status === 'pending' && (
                  <div className="flex gap-3">
                    <button onClick={() => rejectOwner(owner.id)}
                      className="flex-1 border-2 border-red-200 text-red-500 rounded-xl py-3 font-bold hover:bg-red-50 transition-colors">
                      ✗ Reject
                    </button>
                    <button onClick={() => approveOwner(owner.id)}
                      className="flex-[2] btn-primary rounded-xl py-3">
                      ✓ Approve & Activate
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Partner applications */}
      {tab === 'partners' && (
        <div className="space-y-4">
          {pendingPartners.length === 0 ? (
            <Empty label="No delivery partner applications yet" />
          ) : (
            pendingPartners.map(partner => (
              <div key={partner.id} className="glass-1 rounded-3xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-[20px] flex items-center justify-center text-3xl shadow-inner">🛵</div>
                    <div>
                      <p className="font-lexend font-black text-xl text-on-surface leading-tight">{partner.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-0.5">{partner.vehicleType} Logistics Partner</p>
                    </div>
                  </div>
                  {statusBadge(partner.status)}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-5 bg-surface-container rounded-2xl p-4">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Email</p>
                    <p className="font-semibold mt-1 text-on-surface truncate">{partner.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Phone</p>
                    <p className="font-semibold mt-1 text-on-surface">{partner.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">Vehicle</p>
                    <p className="font-semibold mt-1 text-on-surface">{partner.vehicleType}</p>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant mb-4">
                  Applied: {partner.registeredAt.toLocaleString()}
                </p>

                {partner.status === 'pending' && (
                  <div className="flex gap-3">
                    <button onClick={() => rejectPartner(partner.id)}
                      className="flex-1 border-2 border-red-200 text-red-500 rounded-xl py-3 font-bold hover:bg-red-50 transition-colors">
                      ✗ Reject
                    </button>
                    <button onClick={() => approvePartner(partner.id)}
                      className="flex-[2] btn-primary rounded-xl py-3">
                      ✓ Approve Partner
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="glass-1 rounded-3xl p-12 text-center">
      <p className="text-5xl mb-4">📭</p>
      <p className="font-bold text-lg text-on-surface">{label}</p>
      <p className="text-on-surface-variant mt-2 text-sm">Applications will appear here when submitted</p>
    </div>
  );
}
