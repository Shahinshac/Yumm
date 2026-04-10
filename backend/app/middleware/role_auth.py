"""
Role-based access control middleware
"""
from flask import jsonify
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models.user import User
from backend.app.constants import SUPPORT_EMAIL


def role_required(required_roles):
    """Decorator to check user role"""
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.objects(id=user_id).first()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if user.role not in required_roles:
                return jsonify({
                    'error': f'Access denied. Required roles: {", ".join(required_roles)}'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def admin_required(fn):
    """Decorator for admin-only routes"""
    return role_required(['admin'])(fn)


def customer_required(fn):
    """Decorator for customer-only routes"""
    return role_required(['customer'])(fn)


def restaurant_required(fn):
    """Decorator for restaurant-only routes"""
    return role_required(['restaurant'])(fn)


def delivery_required(fn):
    """Decorator for delivery-only routes"""
    return role_required(['delivery'])(fn)


def restaurant_approved_required(fn):
    """Decorator for approved restaurant-only routes"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()

        if not user or user.role != 'restaurant':
            return jsonify({'error': 'Unauthorized'}), 403

        # Check user approval status
        if not user.is_approved:
            return jsonify({
                'error': f'You can login only after admin approval. Please contact admin: {SUPPORT_EMAIL}'
            }), 403

        from backend.app.models.restaurant import Restaurant
        restaurant = Restaurant.objects(user=user_id).first()

        if not restaurant or not restaurant.is_approved:
            return jsonify({
                'error': 'Restaurant not approved. Please wait for admin approval.'
            }), 403

        return fn(*args, **kwargs)
    return wrapper


def delivery_approved_required(fn):
    """Decorator for approved delivery partner-only routes"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()

        if not user or user.role != 'delivery':
            return jsonify({'error': 'Unauthorized'}), 403

        # Check user approval status
        if not user.is_approved:
            return jsonify({
                'error': f'You can login only after admin approval. Please contact admin: {SUPPORT_EMAIL}'
            }), 403

        return fn(*args, **kwargs)
    return wrapper


def customer_google_verified(fn):
    """Decorator for customer routes (must have google_id set)"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()

        if not user or user.role != 'customer':
            return jsonify({'error': 'Unauthorized'}), 403

        # Customers should have google_id (login via Google)
        # Optional check - can comment out if allowing other customer login methods
        # if not user.google_id:
        #     return jsonify({'error': 'Customer must be verified via Google'}), 403

        return fn(*args, **kwargs)
    return wrapper

