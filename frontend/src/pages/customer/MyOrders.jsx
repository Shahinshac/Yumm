import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/store';
import { orderAPI } from '../../services/api';
import '../../styles/customer.css';

export default function MyOrders() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="customer-page">
      <header className="header">
        <button onClick={() => navigate('/customer/home')} className="btn-back">
          ← Back
        </button>
        <h1>My Orders</h1>
      </header>

      <div className="customer-content">
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet</p>
            <button onClick={() => navigate('/customer/home')} className="btn-primary">
              Start ordering
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.id.slice(-6)}</h3>
                  <span className={`status ${order.status}`}>{order.status}</span>
                </div>
                <p className="restaurant">🏪 {order.restaurant_id}</p>
                <p className="date">{new Date(order.created_at).toLocaleDateString()}</p>
                <p className="amount">₹{order.total_amount.toFixed(2)}</p>
                <button
                  onClick={() => navigate(`/customer/track/${order.id}`)}
                  className="btn-track"
                >
                  Track Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
