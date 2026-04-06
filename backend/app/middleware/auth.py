"""
Authentication Middleware
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models.user import User

def role_required(*roles):
    """Decorator to check user role"""
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            try:
                user = User.objects(id=user_id).first()
            except:
                user = None

            if not user:
                return jsonify({'error': 'User not found'}), 404

            if user.role not in roles:
                return jsonify({'error': f'Forbidden. Required role: {", ".join(roles)}'}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator

def required_auth(fn):
    """Simple authentication check"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

def get_current_user():
    """Get current authenticated user"""
    user_id = get_jwt_identity()
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return None
        return {
            'user_id': str(user.id),
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'phone': user.phone,
        }
    except:
        return None
