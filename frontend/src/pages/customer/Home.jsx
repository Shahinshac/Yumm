import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/store';
import { restaurantAPI } from '../../services/api';
import '../../styles/customer.css';

export default function CustomerHome() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(response.data.restaurants || []);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = search
    ? restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.category.toLowerCase().includes(search.toLowerCase())
      )
    : restaurants;

  if (loading) return <div className="loading">Loading restaurants...</div>;

  return (
    <div className="customer-page">
      <header className="header">
        <h1>🍕 FoodHub</h1>
        <div className="header-right">
          <p>Welcome, {user?.full_name || user?.username}!</p>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <nav className="customer-nav">
        <button onClick={() => navigate('/customer/home')} className="active">
          🏠 Home
        </button>
        <button onClick={() => navigate('/customer/orders')}>📦 My Orders</button>
      </nav>

      <div className="customer-content">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="restaurants-grid">
          {filtered.length === 0 ? (
            <p className="no-data">No restaurants found</p>
          ) : (
            filtered.map((restaurant) => (
              <div
                key={restaurant.id}
                className="restaurant-card"
                onClick={() => navigate(`/customer/restaurant/${restaurant.id}`)}
              >
                <div className="restaurant-image">{restaurant.image}</div>
                <div className="restaurant-info">
                  <h3>{restaurant.name}</h3>
                  <p className="category">{restaurant.category}</p>
                  <div className="restaurant-meta">
                    <span className="rating">⭐ {restaurant.rating}</span>
                    <span className="delivery-time">🚚 {restaurant.delivery_time} min</span>
                  </div>
                  <p className="address">{restaurant.address}</p>
                  <p className="min-order">Min ₹{restaurant.min_order}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
