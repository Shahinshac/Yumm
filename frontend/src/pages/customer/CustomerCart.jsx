import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, MapPin, Loader2, CheckCircle, CreditCard, Smartphone, Banknote, X, QrCode, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { customerService } from '../../services/customerService';
import { QRCodeSVG } from 'qrcode.react';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE';

const CustomerCart = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // razorpay | upi | cod
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null); // order data after placement
  const [tipAmount, setTipAmount] = useState(0);

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const platformFee = subtotal > 0 ? 5 : 0;
  const total = subtotal + deliveryFee + platformFee + tipAmount;

  // Build UPI deep-link from restaurant's UPI ID
  const buildUpiLink = (upiId, name, amount) => {
    if (!upiId) return null;
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=FoodOrder`;
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiateRazorpay = async (order) => {
    const ok = await loadRazorpay();
    if (!ok) {
      alert('Failed to load Razorpay. Please try again.');
      return;
    }

    try {
      // Fetch official Razorpay Order ID from backend
      const { data } = await customerService.api.post('/api/payments/create-razorpay-order', { order_id: order.id });
      
      const options = {
        key: data.key_id || RAZORPAY_KEY,
        amount: data.amount,
        currency: data.currency,
        name: cart.restaurantName || 'Yumm Food',
        description: `Order #${order.id?.slice(-6).toUpperCase()}`,
        order_id: data.razorpay_order_id,
        handler: async (response) => {
          // Verify on backend
          await customerService.api.post('/api/payments/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          
          setPlacedOrder({ ...order, payment_status: 'paid' });
          clearCart();
          setTimeout(() => navigate(`/orders/${order.id}/track`), 2000);
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#ff4b3a' },
        modal: {
          ondismiss: () => {
            alert('Payment cancelled or interrupted.');
            setPlacedOrder(order);
            clearCart();
            setTimeout(() => navigate(`/orders/${order.id}/track`), 2000);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment initialization failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    if (!deliveryAddress.trim()) {
      setShowAddressModal(true);
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        restaurant_id: cart.restaurantId,
        items: cart.items.map(i => ({
          id: i.id, name: i.name, price: i.price,
          quantity: i.quantity, qty: i.quantity
        })),
        total_amount: total,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        tip_amount: tipAmount,
        special_instructions: ''
      };

      const res = await customerService.placeOrder(orderData);
      const order = res.order;

      if (paymentMethod === 'razorpay') {
        setLoading(false);
        await initiateRazorpay(order);
      } else if (paymentMethod === 'upi') {
        setPaymentOrder(order);
        setShowPaymentModal(true);
        setLoading(false);
      } else {
        // COD
        setPlacedOrder(order);
        clearCart();
        setLoading(false);
        setTimeout(() => navigate(`/orders/${order.id}/track`), 2000);
      }
    } catch (err) {
      alert('Failed to place order: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleUpiPaid = () => {
    setShowPaymentModal(false);
    setPlacedOrder(paymentOrder);
    clearCart();
    setTimeout(() => navigate(`/orders/${paymentOrder.id}/track`), 2000);
  };

  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 animate-bounce">
          <CheckCircle size={60} />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Order Placed!</h1>
        <p className="text-gray-500 font-medium">
          #{placedOrder.id?.slice(-6).toUpperCase()} has been received. Redirecting...
        </p>
        <div className="pt-4">
          <Loader2 className="animate-spin mx-auto text-[#ff4b3a]" size={30} />
        </div>
      </div>
    );
  }

  const PAYMENT_METHODS = [
    {
      key: 'razorpay',
      icon: CreditCard,
      label: 'Razorpay',
      subtitle: 'UPI, Cards, NetBanking, Wallets',
      badge: 'RECOMMENDED',
      badgeColor: 'bg-orange-100 text-orange-600',
      color: 'border-orange-500 bg-orange-50/30'
    },
    {
      key: 'upi',
      icon: Smartphone,
      label: 'Pay via UPI QR',
      subtitle: 'GPay, PhonePe, Paytm, BHIM',
      badge: 'FREE',
      badgeColor: 'bg-green-100 text-green-700',
      color: 'border-green-500 bg-green-50/30'
    },
    {
      key: 'cod',
      icon: Banknote,
      label: 'Cash on Delivery',
      subtitle: 'Pay cash when your order arrives',
      badge: null,
      badgeColor: '',
      color: 'border-gray-300 bg-gray-50/30'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-200 transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Your Cart</h1>
            <p className="text-sm text-gray-500">
              {cart.restaurantName ? `From ${cart.restaurantName}` : 'Ready to order?'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <ShoppingCart size={16} />
          {cart.items.reduce((a, b) => a + b.quantity, 0)} items
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">Looks like you haven't added anything yet.</p>
          <button onClick={() => navigate('/home')} className="mt-8 bg-[#ff4b3a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e03d2e] transition shadow-lg shadow-red-100 active:scale-95">
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition group">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0 ${item.is_veg ? 'bg-green-50' : 'bg-red-50'}`}>
                  {item.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 font-black">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100 shadow-inner">
                  <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition text-gray-600 active:scale-90">
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => addToCart(item, { id: cart.restaurantId, name: cart.restaurantName })} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition text-gray-600 active:scale-90">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Payment Method */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard size={14} className="text-[#ff4b3a]" /> Payment Method
              </h3>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.key}
                    onClick={() => setPaymentMethod(pm.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === pm.key ? pm.color : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  >
                    <div className={`p-2 rounded-xl ${paymentMethod === pm.key ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                      <pm.icon size={18} className={paymentMethod === pm.key ? 'text-[#ff4b3a]' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{pm.label}</span>
                        {pm.badge && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${pm.badgeColor}`}>{pm.badge}</span>}
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{pm.subtitle}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === pm.key ? 'border-[#ff4b3a]' : 'border-gray-300'}`}>
                      {paymentMethod === pm.key && <div className="w-2 h-2 rounded-full bg-[#ff4b3a]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={clearCart} className="w-full py-4 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition">
              Clear entire cart
            </button>
          </div>

          {/* Checkout Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-[#ff4b3a]" /> Bill Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Item Total</span><span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Delivery Fee</span><span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Platform Fee</span><span>₹{platformFee}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-[#ff4b3a] font-bold">
                    <span>Delivery Partner Tip</span><span>₹{tipAmount}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-4">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">₹{total}</span>
                </div>
              </div>

              {/* Tips Section like Swiggy */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tip your delivery partner</p>
                <div className="flex flex-wrap gap-2">
                  {[20, 30, 50, 100].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTipAmount(tipAmount === amt ? 0 : amt)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tipAmount === amt ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const val = prompt("Enter custom tip amount:");
                      if (val && !isNaN(val)) setTipAmount(Number(val));
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tipAmount > 0 && ![20,30,50,100].includes(tipAmount) ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    Custom
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 mt-2 italic">100% of the tip goes to your delivery partner.</p>
              </div>

              {/* Payment badge */}
              <div className={`mt-4 flex items-center gap-2 p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                paymentMethod === 'razorpay' ? 'bg-orange-50 text-orange-600' :
                paymentMethod === 'upi' ? 'bg-green-50 text-green-700' :
                'bg-gray-50 text-gray-500'
              }`}>
                {paymentMethod === 'razorpay' && <><CreditCard size={12} /> Paying via Razorpay</>}
                {paymentMethod === 'upi' && <><Smartphone size={12} /> Paying via UPI</>}
                {paymentMethod === 'cod' && <><Banknote size={12} /> Cash on Delivery</>}
              </div>

              <button
                disabled={loading}
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-[#ff4b3a] text-white py-4 rounded-2xl font-black hover:bg-[#e03d2e] transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
                {loading ? 'Placing...' : 'Place Order'}
              </button>
            </div>

            {/* Address */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4 shadow-sm">
              <div className="p-3 bg-orange-50 rounded-xl shrink-0">
                <MapPin size={20} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Address</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {deliveryAddress || <span className="text-gray-400 italic font-normal">No address selected</span>}
                </p>
                <button
                  onClick={() => { setAddressInput(deliveryAddress); setShowAddressModal(true); }}
                  className="text-[10px] font-black text-orange-600 uppercase mt-2 hover:underline"
                >
                  {deliveryAddress ? 'Change Address' : '+ Add Address'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">Delivery Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <textarea
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              placeholder="Enter your full delivery address (house no, street, landmark, city)..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#ff4b3a] focus:bg-white outline-none transition-all resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddressModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
              <button
                onClick={() => {
                  if (addressInput.trim()) { setDeliveryAddress(addressInput.trim()); setShowAddressModal(false); }
                }}
                className="flex-1 py-3 bg-[#ff4b3a] text-white font-bold rounded-xl hover:bg-red-600 transition"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI Payment Modal */}
      {showPaymentModal && paymentOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <QrCode size={28} />
              </div>
              <h2 className="text-xl font-black">Scan & Pay</h2>
              <p className="text-green-100 text-sm mt-1">₹{total} · Order #{paymentOrder.id?.slice(-6).toUpperCase()}</p>
            </div>

            <div className="p-6 space-y-5">
              {paymentOrder.restaurant_upi_id ? (
                <>
                  <div className="flex justify-center">
                    <div className="p-3 bg-white rounded-2xl shadow-lg border border-gray-100">
                      <QRCodeSVG
                        value={buildUpiLink(paymentOrder.restaurant_upi_id, cart.restaurantName, total)}
                        size={170}
                        bgColor="#ffffff"
                        fgColor="#1a1a1a"
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 font-medium">
                    Scan with any UPI app · <span className="font-bold text-gray-800">{paymentOrder.restaurant_upi_id}</span>
                  </p>
                  <a
                    href={buildUpiLink(paymentOrder.restaurant_upi_id, cart.restaurantName, total)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-500 text-white rounded-2xl font-black text-sm hover:bg-green-600 transition active:scale-95"
                  >
                    <ExternalLink size={16} /> Open UPI App
                  </a>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm font-medium">Restaurant has no UPI ID configured.</p>
                  <p className="text-xs mt-1">Please pay cash on delivery instead.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowPaymentModal(false)} className="py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition">
                  Cancel
                </button>
                <button onClick={handleUpiPaid} className="py-3 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition active:scale-95">
                  I've Paid ✓
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 font-medium">
                After paying, tap "I've Paid" · Restaurant will verify & accept
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCart;
