"""
Authentication API routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.services.auth_service import AuthService
from app.utils.exceptions import BankingException
from app.middleware.rbac import require_authentication, get_current_user

# Create blueprint
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user

    Request body:
        {
            "username": "john_doe",
            "email": "john@example.com",
            "password": "SecurePass123",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+91-9876543210"
        }

    Returns:
        201: User created successfully
        400: Validation error or user already exists
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["username", "email", "password", "first_name", "last_name", "phone_number"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Call service
        user = AuthService.register_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone_number=data["phone_number"],
        )

        return jsonify({
            "message": "User registered successfully",
            "user": user
        }), 201

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login user and get authentication tokens

    Request body:
        {
            "username": "john_doe",  # Can also use email
            "password": "SecurePass123"
        }

    Returns:
        200: Login successful with tokens
        400: Invalid credentials or validation error
    """
    try:
        data = request.get_json()

        if not data.get("username") or not data.get("password"):
            return jsonify({"error": "Username and password are required"}), 400

        # Call service
        result = AuthService.login(data["username"], data["password"])

        return jsonify(result), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    """
    Refresh access token using refresh token

    Headers:
        Authorization: Bearer <refresh_token>

    Returns:
        200: New access token
        401: Invalid or expired refresh token
    """
    try:
        claims = get_jwt()
        user_id = claims.get("sub")

        # Call service
        result = AuthService.refresh_access_token(user_id)

        return jsonify(result), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/me", methods=["GET"])
@require_authentication
def get_current_user_info():
    """
    Get current authenticated user information

    Headers:
        Authorization: Bearer <access_token>

    Returns:
        200: Current user information
        401: Unauthorized
    """
    try:
        user_info = get_current_user()
        user = AuthService.get_user_by_id(user_info["user_id"])

        return jsonify({
            "user": user.to_dict(),
            "role": user.role.name
        }), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/change-password", methods=["POST"])
@require_authentication
def change_password():
    """
    Change user password

    Headers:
        Authorization: Bearer <access_token>

    Request body:
        {
            "old_password": "OldPass123",
            "new_password": "NewPass456"
        }

    Returns:
        200: Password changed successfully
        400: Invalid old password or validation error
        401: Unauthorized
    """
    try:
        data = request.get_json()
        user_info = get_current_user()

        if not data.get("old_password") or not data.get("new_password"):
            return jsonify({"error": "Old and new passwords are required"}), 400

        # Call service
        result = AuthService.change_password(
            user_id=user_info["user_id"],
            old_password=data["old_password"],
            new_password=data["new_password"]
        )

        return jsonify(result), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.errorhandler(BankingException)
def handle_banking_exception(error):
    """Handle custom banking exceptions"""
    return jsonify({"error": error.message}), error.status_code
