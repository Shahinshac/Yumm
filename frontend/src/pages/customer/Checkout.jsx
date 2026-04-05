import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../../store/store';
import { orderAPI, promoAPI } from '../../services/api';
import '../../styles/customer.css';

export default function Checkout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const cartItems = useCartStore((state) => state.items);
  const restaurant = useCartStore((state) => state.restaurant);
  const getTotal = useCartStore((state) => state.getTotal);
  const clear = useCartStore((state) => state.clear);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const subtotal = getTotal();
  const deliveryCharge = restaurant?.delivery_charge || 50;
  const total = subtotal + deliveryCharge - discount;

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      const res = await promoAPI.validate(promoCode);
      const promo = res.data;
      let disc = 0;
      if (promo.discount_type === 'percentage') {
        disc = (subtotal * promo.discount_value) / 100;
        if (promo.max_discount) disc = Math.min(disc, promo.max_discount);
      } else {
        disc = promo.discount_value;
      }
      setDiscount(disc);
      alert('Promo applied!');
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid promo code');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!deliveryAddress || !restaurant) {
      alert('Please enter delivery address');
      return;
    }

    setLoading(true);
    try {
      const response = await orderAPI.create({
        restaurant_id: restaurant.id,
        items: cartItems.map((item) => ({
          item_id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty
        })),
        delivery_address: deliveryAddress,
        promo_code: promoCode,
        payment_method: 'card'
      });

      const orderId = response.data.order.id;
      clear();
      navigate(`/customer/track/${orderId}`);
    } catch (err) {
      alert(err.response?.data?.error ||'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="customer-page">
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/customer/home')} className="btn-primary">
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page">
      <header className="header">
        <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
        <h1>Checkout</h1>
      </header>

      <div className="checkout-container">
        <div className="checkout-left">
          <div className="section">
            <h2>📍 Delivery Address</h2>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your delivery address"
              className="address-input"
            />
          </div>

          <div className="section">
            <h2>🛍️ Order Items</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>🎟️ Promo Code</h2>
            <div className="promo-section">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="promo-input"
              />
              <button onClick={handleApplyPromo} className="btn-apply">
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="checkout-right">
          <div className="bill-section">
            <h3>Order Summary</h3>
            <div className="bill-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="bill-row">
              <span>Delivery Charge</span>
              <span>₹{deliveryCharge}</span>
            </div>
            {discount > 0 && (
              <div className="bill-row saving">
                <span>Discount</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="bill-row total">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-checkout"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
