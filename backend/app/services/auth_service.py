"""
Authentication service - Business logic for user authentication - RBAC COMPLIANT
"""
from app.models.user import User, RoleEnum
from app.utils.security import PasswordSecurity, TokenManager
from app.utils.validators import Validators
from app.utils.exceptions import (
    AuthenticationError,
    UserAlreadyExistsError,
    ValidationError,
    ResourceNotFoundError,
)
from datetime import datetime


class AuthService:
    """Handle user authentication logic"""

    @staticmethod
    def register_user(
        username: str,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        phone_number: str,
        role: str = "customer",
    ) -> dict:
        """
        Register a new user

        Args:
            username: Unique username
            email: Unique email address
            password: Plain text password
            first_name: First name
            last_name: Last name
            phone_number: Phone number
            role: User role (admin, staff, customer - default: customer)

        Returns:
            Dictionary with user data

        Raises:
            UserAlreadyExistsError: If user already exists
            ValidationError: If input validation fails
        """
        # Validate inputs
        Validators.validate_username(username)
        Validators.validate_email(email)
        Validators.validate_password(password)
        Validators.validate_name(first_name, "First name")
        Validators.validate_name(last_name, "Last name")
        if phone_number:
            Validators.validate_phone(phone_number)

        # Validate role
        if role not in [e.value for e in RoleEnum]:
            role = RoleEnum.CUSTOMER.value

        # Check if user already exists
        existing_user = User.objects(username=username).first()
        if existing_user:
            raise UserAlreadyExistsError("Username already exists")
        
        existing_email = User.objects(email=email).first()
        if existing_email:
            raise UserAlreadyExistsError("Email already exists")

        # Create new user
        password_hash = PasswordSecurity.hash_password(password)
        try:
            user = User(
                username=username,
                email=email,
                password_hash=password_hash,
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number or "",
                role=role,
            )
            user.save()
        except Exception as e:
            raise ValidationError(f"Failed to register user: {str(e)}")

        return user.to_dict()

    @staticmethod
    def login(username: str, password: str) -> dict:
        """
        Login user and return authentication tokens

        Args:
            username: Username or email
            password: Plain text password

        Returns:
            Dictionary with tokens, user data, and role (for frontend routing)

        Raises:
            AuthenticationError: If credentials are invalid or user not found
        """
        # Find user by username or email
        user = User.objects(username=username).first() or User.objects(email=username).first()

        if not user:
            raise AuthenticationError("Invalid credentials")

        if not user.is_active:
            raise AuthenticationError("Account is disabled")

        # Verify password
        if not PasswordSecurity.verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid credentials")

        # Update last login
        user.last_login = datetime.utcnow()
        user.save()

        # Create tokens with role in claims
        tokens = TokenManager.create_tokens(str(user.id), user.username, user.role)

        return {
            "user": user.to_dict(),
            "tokens": tokens,
            "role": user.role,  # For frontend routing
            "user_id": str(user.id)
        }

    @staticmethod
    def refresh_access_token(user_id: str) -> dict:
        """
        Refresh access token using refresh token

        Args:
            user_id: User ID from refresh token

        Returns:
            Dictionary with new access token

        Raises:
            ResourceNotFoundError: If user not found
        """
        try:
            user = User.objects(id=user_id).first()
        except Exception:
            user = None

        if not user:
            raise ResourceNotFoundError("User not found")

        if not user.is_active:
            raise AuthenticationError("Account is disabled")

        # Create new access token only
        access_token = TokenManager.create_access_token(
            str(user.id), user.username, user.role
        )

        return {
            "access_token": access_token,
            "token_type": "Bearer",
        }

    @staticmethod
    def get_user_by_id(user_id: str) -> User:
        """
        Get user by ID

        Args:
            user_id: User ID

        Returns:
            User object

        Raises:
            ResourceNotFoundError: If user not found
        """
        try:
            user = User.objects(id=user_id).first()
        except Exception:
            user = None

        if not user:
            raise ResourceNotFoundError("User not found")

        return user

    @staticmethod
    def change_password(user_id: str, old_password: str, new_password: str) -> dict:
        """
        Change user password

        Args:
            user_id: User ID
            old_password: Current password
            new_password: New password

        Returns:
            Success message

        Raises:
            AuthenticationError: If old password is incorrect
            ValidationError: If new password doesn't meet requirements
        """
        user = AuthService.get_user_by_id(user_id)

        # Verify old password
        if not PasswordSecurity.verify_password(old_password, user.password_hash):
            raise AuthenticationError("Current password is incorrect")

        # Validate new password
        Validators.validate_password(new_password)

        # Update password
        user.password_hash = PasswordSecurity.hash_password(new_password)
        user.save()

        return {"message": "Password changed successfully"}


def ensure_default_admin_exists():
    """
    Ensure default admin user exists
    Call this during app startup

    Creates shahinsha with password 262007 if no admin exists
    """
    try:
        # Check if any admin exists
        admin_exists = User.objects(role=RoleEnum.ADMIN.value).first()

        if admin_exists:
            return {
                "created": False,
                "message": "Admin already exists"
            }

        # Create default admin
        admin_user = User(
            username="shahinsha",
            email="admin@26-07-reserve.bank",
            password_hash=PasswordSecurity.hash_password("262007"),
            first_name="System",
            last_name="Admin",
            phone_number="+91-9876543210",
            role=RoleEnum.ADMIN.value,
            is_active=True,
            is_verified=True,
            is_first_login=False
        )
        admin_user.save()

        return {
            "created": True,
            "message": "Default admin created successfully",
            "admin": {
                "username": "shahinsha",
                "email": "admin@26-07-reserve.bank",
                "password": "262007"
            }
        }
    except Exception as e:
        raise Exception(f"Failed to ensure default admin: {str(e)}")
