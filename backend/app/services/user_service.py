"""
User management service - Business logic for user operations
"""
from app import db
from app.models.user import User, Role, RoleEnum
from app.utils.exceptions import (
    ResourceNotFoundError,
    ValidationError,
    AuthorizationError,
)
from datetime import datetime


class UserService:
    """Handle user management operations"""

    @staticmethod
    def get_all_users(page: int = 1, per_page: int = 20) -> dict:
        """
        Get all users with pagination

        Args:
            page: Page number (1-indexed)
            per_page: Users per page

        Returns:
            Dictionary with users list and pagination info
        """
        query = User.query.order_by(User.created_at.desc())
        paginated = query.paginate(page=page, per_page=per_page)

        return {
            "users": [user.to_dict() for user in paginated.items],
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": page,
        }

    @staticmethod
    def get_user_by_id(user_id: int) -> User:
        """
        Get user by ID

        Args:
            user_id: User ID

        Returns:
            User object

        Raises:
            ResourceNotFoundError: If user not found
        """
        user = User.query.get(user_id)

        if not user:
            raise ResourceNotFoundError(f"User with ID {user_id} not found")

        return user

    @staticmethod
    def get_user_by_username(username: str) -> User:
        """
        Get user by username

        Args:
            username: Username

        Returns:
            User object

        Raises:
            ResourceNotFoundError: If user not found
        """
        user = User.query.filter_by(username=username).first()

        if not user:
            raise ResourceNotFoundError(f"User {username} not found")

        return user

    @staticmethod
    def get_user_by_email(email: str) -> User:
        """
        Get user by email

        Args:
            email: Email address

        Returns:
            User object

        Raises:
            ResourceNotFoundError: If user not found
        """
        user = User.query.filter_by(email=email).first()

        if not user:
            raise ResourceNotFoundError(f"User with email {email} not found")

        return user

    @staticmethod
    def update_user(user_id: int, **kwargs) -> User:
        """
        Update user information

        Args:
            user_id: User ID
            **kwargs: Fields to update (first_name, last_name, phone_number)

        Returns:
            Updated user object

        Raises:
            ResourceNotFoundError: If user not found
            ValidationError: If validation fails
        """
        user = UserService.get_user_by_id(user_id)

        # Allow updating these fields only
        allowed_fields = {"first_name", "last_name", "phone_number", "is_active", "is_verified"}
        update_fields = {k: v for k, v in kwargs.items() if k in allowed_fields}

        if not update_fields:
            raise ValidationError("No valid fields to update")

        # Validate phone if being updated
        if "phone_number" in update_fields:
            from app.utils.validators import Validators
            Validators.validate_phone(update_fields["phone_number"])

            # Check if phone already exists
            existing = User.query.filter(
                (User.phone_number == update_fields["phone_number"]) & (User.id != user_id)
            ).first()

            if existing:
                raise ValidationError("Phone number already in use")

        # Validate names if being updated
        if "first_name" in update_fields:
            from app.utils.validators import Validators
            Validators.validate_name(update_fields["first_name"], "First name")

        if "last_name" in update_fields:
            from app.utils.validators import Validators
            Validators.validate_name(update_fields["last_name"], "Last name")

        # Update fields
        for field, value in update_fields.items():
            setattr(user, field, value)

        user.updated_at = datetime.utcnow()
        db.session.commit()

        return user

    @staticmethod
    def assign_role(user_id: int, role_name: str) -> User:
        """
        Assign role to user

        Args:
            user_id: User ID
            role_name: Role name (admin, manager, staff, customer)

        Returns:
            Updated user object

        Raises:
            ResourceNotFoundError: If user or role not found
            ValidationError: If role invalid
        """
        user = UserService.get_user_by_id(user_id)

        # Validate role exists
        role = Role.query.filter_by(name=role_name).first()

        if not role:
            available_roles = ", ".join([r.name for r in Role.query.all()])
            raise ValidationError(f"Invalid role. Available: {available_roles}")

        user.role_id = role.id
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return user

    @staticmethod
    def deactivate_user(user_id: int) -> User:
        """
        Deactivate user (disable account)

        Args:
            user_id: User ID

        Returns:
            Updated user object
        """
        user = UserService.get_user_by_id(user_id)

        user.is_active = False
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return user

    @staticmethod
    def activate_user(user_id: int) -> User:
        """
        Activate user (enable account)

        Args:
            user_id: User ID

        Returns:
            Updated user object
        """
        user = UserService.get_user_by_id(user_id)

        user.is_active = True
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return user

    @staticmethod
    def search_users(query: str, search_type: str = "username") -> list:
        """
        Search users by username, email, or phone

        Args:
            query: Search query string
            search_type: Search field (username, email, phone)

        Returns:
            List of matching users
        """
        if search_type == "username":
            users = User.query.filter(User.username.ilike(f"%{query}%")).all()
        elif search_type == "email":
            users = User.query.filter(User.email.ilike(f"%{query}%")).all()
        elif search_type == "phone":
            users = User.query.filter(User.phone_number.contains(query)).all()
        else:
            raise ValidationError("Invalid search type")

        return users
