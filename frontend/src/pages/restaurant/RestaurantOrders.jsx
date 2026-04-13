import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle, Loader2, Play, Check, IndianRupee, ShieldCheck, QrCode, X } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';
import { QRCodeSVG } from 'qrcode.react';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [showQrModal, setShowQrModal] = useState(null); // order object

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await restaurantService.getOrders(activeTab === 'all' ? '' : activeTab);
      setOrders(data);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const setActionState = (id, state) => setActionLoading(prev => ({ ...prev, [id]: state }));

  const handleAccept = async (order) => {
    // For UPI orders, require payment verification first
    if ((order.payment_method === 'upi' || order.payment_method === 'razorpay') && order.payment_status !== 'paid') {
      alert('Please verify payment first before accepting this order.');
      return;
    }
    setActionState(order.id, 'accepting');
    try {
      await restaurantService.acceptOrder(order.id);
      await loadOrders();
    } catch (err) {
      alert('Failed to accept order: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionState(order.id, null);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    setActionState(orderId, 'verifying');
    try {
      await restaurantService.verifyPayment(orderId);
      await loadOrders();
    } catch (err) {
      alert('Failed to verify payment.');
    } finally {
      setActionState(orderId, null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this order?')) return;
    setActionState(id, 'rejecting');
    try {
      await restaurantService.rejectOrder(id, 'Restaurant rejected');
      await loadOrders();
    } catch (err) {
      alert('Rejection failed.');
    } finally {
      setActionState(id, null);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setActionState(id, 'updating');
    try {
      await restaurantService.updateOrderStatus(id, status);
      await loadOrders();
    } catch (err) {
      alert('Status update failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionState(id, null);
    }
  };

  const PAYMENT_BADGE = {
    razorpay: { label: 'Razorpay', color: 'bg-orange-50 text-orange-600' },
    upi: { label: 'UPI', color: 'bg-green-50 text-green-700' },
    cod: { label: 'COD', color: 'bg-gray-100 text-gray-600' },
  };

  const PAYMENT_STATUS_BADGE = {
    paid: { label: '✓ Paid', color: 'bg-green-100 text-green-700' },
    cod_pending: { label: 'Collect Cash', color: 'bg-yellow-50 text-yellow-700' },
    pending: { label: 'Awaiting Payment', color: 'bg-red-50 text-red-600' },
  };

  const getStatusColor = (status) => {
    const m = {
      placed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      accepted: 'bg-blue-50 text-blue-700 border-blue-200',
      preparing: 'bg-purple-50 text-purple-700 border-purple-200',
      assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      picked: 'bg-orange-50 text-orange-700 border-orange-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-500 border-red-100',
    };
    return m[status] || 'bg-gray-50 text-gray-500 border-gray-100';
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage incoming requests · Auto-refreshes every 15s</p>
        </div>
        <button onClick={loadOrders} className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
          <Loader2 size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
        {['all', 'placed', 'accepted', 'preparing', 'delivered', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === tab ? 'bg-gray-900 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-500 hover:text-orange-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing kitchen...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-200" />
          </div>
          <h2 className="text-xl font-black text-gray-900">No Orders Currently</h2>
          <p className="text-gray-500 mt-2 font-medium">When customers order, they appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map(order => {
            if (!order || !order.id) return null;
            const isLoading = !!actionLoading[order.id];
            const payBadge = PAYMENT_BADGE[order.payment_method || 'cod'] || PAYMENT_BADGE.cod;
            const payStatus = PAYMENT_STATUS_BADGE[order.payment_status || 'pending'] || PAYMENT_STATUS_BADGE.pending;
            const needsPayment = (order.payment_method === 'upi') && order.payment_status !== 'paid' && order.status === 'placed';
            const upiQrValue = order.restaurant_upi_id
              ? `upi://pay?pa=${order.restaurant_upi_id}&am=${order.total_amount || 0}&cu=INR&tn=Order${order.id?.slice(-6)}`
              : '';
            const items = order.items || [];

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-black text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border-2 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${payBadge.color}`}>{payBadge.label}</span>
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${payStatus.color}`}>{payStatus.label}</span>
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-orange-50 text-orange-600 rounded-md flex items-center justify-center text-[10px] font-black">
                              {item.quantity || item.qty || 0}
                            </div>
                            <span className="text-sm font-bold text-gray-700">{item.name || 'Unknown Item'}</span>
                          </div>
                        ))}
                        {items.length === 0 && <p className="text-xs text-gray-400 italic">No items listed</p>}
                      </div>

                      {order.delivery_address && (
                        <p className="text-xs text-gray-400 font-medium">📍 {order.delivery_address}</p>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-4 min-w-[220px]">
                      <p className="text-3xl font-black text-gray-900">₹{order.total_amount}</p>

                      <div className="flex flex-col gap-2 w-full">
                        {/* UPI: show verify payment if pending */}
                        {needsPayment && (
                          <div className="space-y-2">
                            {upiQrValue && (
                              <button
                                onClick={() => setShowQrModal(order)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-black hover:bg-green-100 transition"
                              >
                                <QrCode size={14} /> View Payment QR
                              </button>
                            )}
                            <button
                              disabled={isLoading}
                              onClick={() => handleVerifyPayment(order.id)}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-100"
                            >
                              {isLoading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                              VERIFY PAYMENT RECEIVED
                            </button>
                          </div>
                        )}

                        {/* Accept / Reject for placed orders */}
                        {order.status === 'placed' && (
                          <div className="flex gap-2">
                            <button
                              disabled={isLoading || needsPayment}
                              onClick={() => handleAccept(order)}
                              className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-xs font-black hover:bg-orange-600 transition flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {isLoading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} ACCEPT
                            </button>
                            <button
                              disabled={isLoading}
                              onClick={() => handleReject(order.id)}
                              className="px-4 py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-black hover:bg-red-100 transition active:scale-95"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}

                        {/* Status progression after accepted */}
                        {order.status === 'accepted' && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleUpdateStatus(order.id, 'preparing')}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl text-xs font-black hover:bg-purple-700 transition flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-purple-100"
                          >
                            {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />} START COOKING
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                            className="w-full bg-green-500 text-white py-3 rounded-xl text-xs font-black hover:bg-green-600 transition flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-green-100"
                          >
                            {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} MARK AS READY
                          </button>
                        )}

                        {['assigned', 'picked', 'delivered', 'cancelled'].includes(order.status) && (
                          <div className={`text-[10px] font-black uppercase tracking-widest text-center w-full py-2 rounded-xl ${
                            order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                            'bg-gray-50 text-gray-400'
                          }`}>
                            {order.status === 'delivered' ? '✓ Delivered' :
                             order.status === 'cancelled' ? '✕ Cancelled' :
                             order.status === 'assigned' ? 'Partner Assigned' :
                             'Out for Delivery'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPI QR Modal for restaurant */}
      {showQrModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white text-center">
              <QrCode size={24} className="mx-auto mb-2" />
              <h2 className="font-black">Order Payment QR</h2>
              <p className="text-green-100 text-sm">#{showQrModal.id.slice(-6).toUpperCase()} · ₹{showQrModal.total_amount}</p>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              {showQrModal.restaurant_upi_id ? (
                <>
                  <div className="p-3 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <QRCodeSVG
                      value={`upi://pay?pa=${showQrModal.restaurant_upi_id}&am=${showQrModal.total_amount}&cu=INR`}
                      size={150}
                      bgColor="#ffffff"
                      fgColor="#1a1a1a"
                      level="H"
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-700">{showQrModal.restaurant_upi_id}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No UPI ID configured.</p>
              )}
              <button
                onClick={() => setShowQrModal(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
