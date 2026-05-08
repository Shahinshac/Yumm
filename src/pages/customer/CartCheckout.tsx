import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

type PaymentMethod = 'apple' | 'google' | 'card' | 'cash';

export default function CartCheckout() {
  const navigate = useNavigate();
  const { cart, cartTotal, removeFromCart, placeOrder, userLocation } = useApp();
  const [address] = useState(userLocation);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [placing, setPlacing] = useState(false);

  const delivery = 4.99;
  const service = 2.50;
  const grandTotal = cartTotal + delivery + service;
  const restaurantId = cart[0]?.menuItem ? 'r1' : '';

  const handleOrder = () => {
    if (!cart.length) return;
    setPlacing(true);
    const order = placeOrder(restaurantId, address);
    setTimeout(() => {
      navigate(`/customer/track/${order.id}`);
    }, 1200); // Slightly longer for better "processing" feel
  };

  const paymentOptions: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'card', label: 'Credit Card', icon: '💳' },
    { id: 'apple', label: 'Apple Pay', icon: '🍎' },
    { id: 'google', label: 'Google Pay', icon: '🤖' },
    { id: 'cash', label: 'Cash', icon: '💵' },
  ];

  if (!cart.length) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-surface">
      <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center text-6xl mb-6">🛒</div>
      <h2 className="font-lexend font-bold text-3xl text-on-surface">Your cart is empty</h2>
      <p className="text-on-surface-variant mt-3 max-w-xs mx-auto">Looks like you haven't added any gourmet delights to your cart yet.</p>
      <button onClick={() => navigate('/customer')} 
        className="btn-primary mt-8 px-10 py-4 rounded-2xl text-lg shadow-xl shadow-primary/20 transition-all active:scale-95">
        Explore Restaurants
      </button>
    </div>
  );

  return (
    <div className="bg-surface min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md pt-14 px-6 pb-4 flex items-center justify-between border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-surface-container transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-lexend font-bold text-2xl">Checkout</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Summary</p>
          <p className="font-lexend font-bold text-primary">${grandTotal.toFixed(2)}</p>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 pt-8 space-y-8">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between px-2">
          {[
            { label: 'Cart', status: 'done' },
            { label: 'Details', status: 'active' },
            { label: 'Payment', status: 'pending' }
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${s.status === 'active' ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 
                    s.status === 'done' ? 'bg-emerald-500 text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                  {s.status === 'done' ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${s.status === 'active' ? 'text-primary' : 'text-on-surface-variant'}`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 h-[2px] bg-outline-variant mx-4 -mt-6" />}
            </React.Fragment>
          ))}
        </div>

        {/* Section: Delivery */}
        <div className="space-y-4">
          <h3 className="font-lexend font-bold text-xl px-1">Delivery Destination</h3>
          <div className="glass-2 rounded-3xl p-6 flex items-start gap-4 border border-outline-variant/30 shadow-xl shadow-charcoal/5">
            <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-lexend font-bold text-lg text-on-surface">Home</p>
                <button className="text-primary font-bold text-xs uppercase tracking-wider hover:underline">Change</button>
              </div>
              <p className="text-on-surface-variant mt-1 leading-relaxed">{address}</p>
              <div className="mt-4 flex gap-2">
                <span className="badge-orange text-[10px] py-1">Business Hour</span>
                <span className="badge-green text-[10px] py-1">Secure Drop-off</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-lexend font-bold text-xl">Review Order</h3>
            <span className="text-on-surface-variant text-sm font-bold">{cart.length} Items</span>
          </div>
          <div className="space-y-3">
            {cart.map(({ menuItem, quantity, selectedPortion }, idx) => {
              const itemPrice = selectedPortion ? selectedPortion.price : menuItem.price;
              return (
                <div key={`${menuItem.id}-${idx}`} className="glass-1 rounded-3xl p-4 flex gap-4 items-center group transition-all hover:bg-surface-container/40 border border-outline-variant/10">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-outline-variant/30">
                    <img src={menuItem.imageUrl} alt={menuItem.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-on-surface truncate">{menuItem.name}</p>
                      {selectedPortion && (
                        <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-md border border-primary/20">{selectedPortion.label}</span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{menuItem.description}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-lexend font-bold text-on-surface">${(itemPrice * quantity).toFixed(2)}</p>
                    <div className="flex items-center gap-2 bg-surface-container rounded-lg px-2 py-0.5 border border-outline-variant/30">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase">Qty</span>
                      <span className="text-xs font-bold text-primary">{quantity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Payment */}
        <div className="space-y-4">
          <h3 className="font-lexend font-bold text-xl px-1">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map(opt => (
              <button key={opt.id} onClick={() => setPaymentMethod(opt.id)}
                className={`flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all duration-300
                  ${paymentMethod === opt.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-outline-variant bg-white hover:border-primary/30'}`}>
                <span className="text-2xl">{opt.icon}</span>
                <span className={`font-bold text-sm ${paymentMethod === opt.id ? 'text-primary' : 'text-on-surface-variant'}`}>{opt.label}</span>
                {paymentMethod === opt.id && (
                  <div className="ml-auto w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Bill */}
        <div className="glass-1 rounded-[32px] p-8 space-y-4 border border-outline-variant/20">
          <h3 className="font-lexend font-bold text-xl mb-2">Final Settlement</h3>
          <div className="space-y-3 pb-4 border-b border-outline-variant/30">
            <div className="flex justify-between text-on-surface-variant font-medium">
              <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant font-medium">
              <span>Delivery Premium</span><span>${delivery.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant font-medium">
              <span>Service & Tech Fee</span><span>${service.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="font-lexend font-bold text-2xl text-on-surface">Total Amount</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Taxes included</p>
            </div>
            <span className="font-lexend font-bold text-3xl text-primary">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-8 pt-4 bg-gradient-to-t from-surface via-surface to-transparent">
        <div className="max-w-md mx-auto">
          <button onClick={handleOrder} disabled={placing}
            className="w-full relative overflow-hidden group btn-primary rounded-[24px] py-5 text-xl shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-80">
            {placing ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-lexend font-bold tracking-tight">Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between px-6">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Confirm Order</p>
                  <p className="font-lexend font-black">${grandTotal.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-lexend font-bold">Place Order</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </button>
        </div>
      </div>
    </div>
  );
}
