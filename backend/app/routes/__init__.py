"""Routes package - FoodHub API endpoints"""
# Explicit imports for better IDE support and troubleshooting
from . import auth, customer, admin, restaurants, orders, delivery, reviews, promo
from . import admin_dashboard, delivery_dashboard, restaurant_dashboard

__all__ = [
    'auth',
    'customer',
    'admin',
    'restaurants',
    'orders',
    'delivery',
    'reviews',
    'promo',
    'admin_dashboard',
    'delivery_dashboard',
    'restaurant_dashboard',
]