import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI } from '../../services/api';
import { useCartStore, useAuthStore } from '../../store/store';
import '../../styles/customer.css';

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);
  const setRestaurant: useCartStore((state) => state.setRestaurant);

  useEffect(() => {
    fetchRestaurantMenu();
  }, [id]);

  const fetchRestaurantMenu = async () => {
    try {
      const resRes = await restaurantAPI.getById(id);
      const menuRes = await restaurantAPI.getMenu(id);
      setRestaurant(resRes.data.restaurant);
      setMenu(menuRes.data.categories);
      setRestaurant: menuRes.data.restaurant;
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading menu...</div>;
  if (!restaurant) return <div className="error">Restaurant not found</div>;

  const handleAddToCart = (item) => {
    addItem(item);
    setRestaurant(restaurant);
    alert('Added to cart!');
  };

  return (
    <div className="customer-page">
      <header className="header">
        <button onClick={() => navigate('/customer/home')} className="btn-back">
          ← Back
        </button>
        <h1>{restaurant.name}</h1>
        <button onClick={() => navigate('/customer/checkout')} className="btn-cart">
          🛒 Checkout
        </button>
      </header>

      <div className="customer-content">
        <div className="restaurant-header">
          <div className="rest-image">{restaurant.image}</div>
          <div className="rest-details">
            <h2>{restaurant.name}</h2>
            <p>{restaurant.category}</p>
            <p>⭐ {restaurant.rating} • 🚚 {restaurant.delivery_time} min • Delivery ₹{restaurant.delivery_charge}</p>
          </div>
        </div>

        <div className="menu-categories">
          {Object.entries(menu).map(([category, items]) => (
            <div key={category} className="category-section">
              <h3>{category}</h3>
              <div className="menu-items">
                {items.map((item) => (
                  <div key={item.id} className="menu-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <p className="price">₹{item.price}</p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="btn-add"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
