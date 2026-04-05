"""
Admin-only routes - /api/admin/*
"""
from flask import Blueprint, request, jsonify
from app.middleware.rbac import role_required, get_current_user_dict
from app.models.user import User, RoleEnum
from app.models.account import Account
from app.services.account_service import AccountService
from app.services.auth_service import AuthService
from app.utils.security import PasswordSecurity
import logging

logger = logging.getLogger(__name__)

admin_routes = Blueprint("admin_routes", __name__, url_prefix="/api/admin")


@admin_routes.route("/dashboard", methods=["GET"])
@role_required("admin")
def admin_dashboard():
    """
    Admin dashboard - Overview statistics
    
    Returns:
        200: Dashboard data
        403: Not authorized
    """
    try:
        total_users = User.objects.count()
        total_accounts = Account.objects.count()
        active_users = User.objects(is_active=True).count()
        
        users_by_role = {}
        for role in RoleEnum:
            users_by_role[role.value] = User.objects(role=role.value).count()
        
        return jsonify({
            "message": "Admin Dashboard",
            "stats": {
                "total_users": total_users,
                "total_accounts": total_accounts,
                "active_users": active_users,
                "users_by_role": users_by_role
            },
            "current_user": get_current_user_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Admin dashboard error: {str(e)}")
        return jsonify({"error": "Failed to load dashboard"}), 500


@admin_routes.route("/users", methods=["GET"])
@role_required("admin")
def list_all_users():
    """
    List all users in system
    
    Returns:
        200: User list
    """
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        role_filter = request.args.get("role")
        
        query = {}
        if role_filter and role_filter in [e.value for e in RoleEnum]:
            query["role"] = role_filter
        
        users = User.objects(**query).skip((page - 1) * per_page).limit(per_page)
        total = User.objects(**query).count()
        
        return jsonify({
            "users": [u.to_dict() for u in users],
            "total": total,
            "page": page,
            "per_page": per_page
        }), 200
        
    except Exception as e:
        logger.error(f"List users error: {str(e)}")
        return jsonify({"error": "Failed to fetch users"}), 500


@admin_routes.route("/users", methods=["POST"])
@role_required("admin")
def create_user():
    """
    Create new user (admin can assign any role)
    
    Body:
        {
            "username": "string",
            "email": "string",
            "password": "string",
            "first_name": "string",
            "last_name": "string",
            "role": "admin|staff|customer"
        }
    
    Returns:
        201: User created
        400: Validation error
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ["username", "email", "password", "first_name", "last_name"]
        for field in required:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        
        # Validate role
        role = data.get("role", RoleEnum.CUSTOMER.value)
        if role not in [e.value for e in RoleEnum]:
            return jsonify({"error": f"Invalid role. Must be one of: {[e.value for e in RoleEnum]}"}), 400
        
        # Check if user exists
        if User.objects(username=data["username"]).first():
            return jsonify({"error": "Username already exists"}), 400
        
        if User.objects(email=data["email"]).first():
            return jsonify({"error": "Email already exists"}), 400
        
        # Create user
        user = User(
            username=data["username"],
            email=data["email"],
            password_hash=PasswordSecurity.hash_password(data["password"]),
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone_number=data.get("phone_number", ""),
            role=role,
            is_active=data.get("is_active", True)
        )
        user.save()
        
        logger.info(f"Admin created user: {user.username} with role: {role}")
        
        return jsonify({
            "message": "User created successfully",
            "user": user.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Create user error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@admin_routes.route("/users/<user_id>", methods=["DELETE"])
@role_required("admin")
def delete_user(user_id):
    """
    Delete user (admin only)
    
    Returns:
        200: User deleted
        404: User not found
    """
    try:
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Prevent deleting own account
        current_user = get_current_user_dict()
        if str(user.id) == current_user["user_id"]:
            return jsonify({"error": "Cannot delete your own account"}), 400
        
        username = user.username
        user.delete()
        
        logger.info(f"Admin deleted user: {username}")
        
        return jsonify({"message": f"User {username} deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f"Delete user error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@admin_routes.route("/accounts", methods=["POST"])
@role_required("admin")
def create_bank_account():
    """
    Create bank account for any user (admin only)
    
    Body:
        {
            "user_id": "string",
            "account_type": "savings|current|salary",
            "initial_balance": 0
        }
    
    Returns:
        201: Account created
    """
    try:
        data = request.get_json()
        
        if not data.get("user_id"):
            return jsonify({"error": "user_id is required"}), 400
        
        user = User.objects(id=data["user_id"]).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        account, card = AccountService.create_account(
            user_id=data["user_id"],
            account_type=data.get("account_type", "savings"),
            initial_balance=data.get("initial_balance", 0)
        )
        
        logger.info(f"Admin created account for user: {user.username}")
        
        return jsonify({
            "message": "Account created successfully",
            "account": account.to_dict(),
            "card": card.to_dict() if card else None
        }), 201
        
    except Exception as e:
        logger.error(f"Create account error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@admin_routes.route("/users/<user_id>/role", methods=["PUT"])
@role_required("admin")
def change_user_role(user_id):
    """
    Change user role
    
    Body:
        {
            "role": "admin|staff|customer"
        }
    
    Returns:
        200: Role updated
    """
    try:
        data = request.get_json()
        new_role = data.get("role")
        
        if not new_role or new_role not in [e.value for e in RoleEnum]:
            return jsonify({"error": f"Invalid role. Must be one of: {[e.value for e in RoleEnum]}"}), 400
        
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        old_role = user.role
        user.role = new_role
        user.save()
        
        logger.info(f"Admin changed user {user.username} role from {old_role} to {new_role}")
        
        return jsonify({
            "message": "Role updated successfully",
            "user": user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Change role error: {str(e)}")
        return jsonify({"error": str(e)}), 500
