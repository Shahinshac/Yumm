"""
Role-Based Access Control (RBAC) middleware - SECURE IMPLEMENTATION
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.models.user import User, RoleEnum
import logging

logger = logging.getLogger(__name__)


def role_required(*allowed_roles):
    """
    Secure RBAC decorator - Fetches user from DB and verifies role
    
    Args:
        allowed_roles: One or more role names (e.g., 'admin', 'staff', 'customer')
    
    Usage:
        @role_required('admin')
        @role_required('admin', 'staff')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                # Step 1: Verify JWT token
                verify_jwt_in_request()
                
                # Step 2: Get user_id from JWT
                user_id = get_jwt_identity()
                
                # Step 3: Fetch user from database
                user = User.objects(id=user_id).first()
                
                if not user:
                    logger.warning(f"User {user_id} not found in database")
                    return jsonify({"error": "User not found"}), 404
                
                if not user.is_active:
                    logger.warning(f"Inactive user {user_id} attempted access")
                    return jsonify({"error": "Account is inactive"}), 403
                
                # Step 4: Check role authorization
                if user.role not in allowed_roles:
                    logger.warning(
                        f"User {user.username} ({user.role}) attempted to access "
                        f"endpoint requiring: {allowed_roles}"
                    )
                    return jsonify({
                        "error": "Forbidden",
                        "message": f"This action requires one of these roles: {', '.join(allowed_roles)}",
                        "required_roles": list(allowed_roles),
                        "your_role": user.role
                    }), 403
                
                # Step 5: Execute protected function
                return fn(*args, **kwargs)
                
            except Exception as e:
                logger.error(f"RBAC error: {str(e)}")
                return jsonify({"error": "Authorization failed"}), 401
        
        return wrapper
    return decorator


def require_authentication(fn):
    """
    Require valid JWT token (any authenticated user)
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            
            user = User.objects(id=user_id).first()
            if not user or not user.is_active:
                return jsonify({"error": "Unauthorized"}), 401
                
            return fn(*args, **kwargs)
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return jsonify({"error": "Unauthorized"}), 401
    
    return wrapper


def get_current_user():
    """
    Get current authenticated user from database
    
    Returns:
        User object or None
    """
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        return User.objects(id=user_id).first()
    except:
        return None


def get_current_user_dict():
    """
    Get current user as dictionary
    
    Returns:
        dict with user_id, username, role, email
    """
    user = get_current_user()
    if not user:
        return None
    
    return {
        "user_id": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active
    }


# Role constants
ADMIN_ONLY = ("admin",)
STAFF_ONLY = ("staff",)
CUSTOMER_ONLY = ("customer",)
ADMIN_STAFF = ("admin", "staff")
ANYONE_AUTHENTICATED = ("admin", "staff", "customer")
