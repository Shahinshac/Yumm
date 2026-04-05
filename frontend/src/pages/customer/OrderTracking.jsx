import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI, reviewAPI } from '../../services/api';
import '../../styles/customer.css';

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({
    rating: 5,
    review_text: '',
    food_quality: 5,
    delivery_speed: 5,
    packaging: 5
  });

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await orderAPI.track(orderId);
      setOrder(res.data);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await reviewAPI.create({
        order_id: orderId,
        ...review
      });
      alert('Review submitted!');
      setShowReviewForm(false);
    } catch (err) {
      alert('Failed to submit review');
    }
  };

  if (loading) return <div className="loading">Loading order...</div>;
  if (!order) return <div className="error">Order not found</div>;

  const statusSteps = ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="customer-page">
      <header className="header">
        <button onClick={() => navigate('/customer/orders')} className="btn-back">
          ← Back
        </button>
        <h1>Order Tracking</h1>
      </header>

      <div className="tracking-container">
        <div className="order-status">
          <h2>Status</h2>
          <div className="status-timeline">
            {statusSteps.map((step, idx) => (
              <div
                key={step}
                className={`step ${idx <= currentStep ? 'active' : ''}`}
              >
                <div className="step-dot"></div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-info">
          <h2>🏪 Restaurant</h2>
          <p>{order.restaurant.name}</p>
          <p className="address">{order.restaurant.location?.address}</p>

          <h2>📍 Delivery Address</h2>
          <p>{order.delivery_address}</p>

          <h2>💰 Order Total</h2>
          <p className="amount">₹{order.total_amount || 'N/A'}</p>

          <h2>⏰ Estimated Delivery</h2>
          <p>{order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleTimeString() : 'N/A'}</p>

          {order.status === 'delivered' && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-review"
            >
              ⭐ Leave Review
            </button>
          )}
        </div>

        {showReviewForm && (
          <div className="review-form">
            <h2>✏️ Leave a Review</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Overall Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setReview({ ...review, rating: star })}
                      className={review.rating >= star ? 'star active' : 'star'}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Review</label>
                <textarea
                  value={review.review_text}
                  onChange={(e) => setReview({ ...review, review_text: e.target.value })}
                  placeholder="Share your experience..."
                />
              </div>

              <button type="submit" className="btn-primary">
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
