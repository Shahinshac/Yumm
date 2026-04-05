"""
User and Role database models using MongoEngine - RBAC Compliant
"""
from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField
from datetime import datetime
from enum import Enum


class RoleEnum(Enum):
    """User roles in the banking system"""
    ADMIN = "admin"
    STAFF = "staff"
    CUSTOMER = "customer"


class User(Document):
    """User model with role-based access control"""
    meta = {
        'collection': 'users',
        'indexes': [
            'username',
            'email',
            'phone_number',
            'role'
        ]
    }

    # Authentication
    username = StringField(required=True, unique=True, max_length=80)
    email = StringField(required=True, unique=True, max_length=120)
    password_hash = StringField(required=True, max_length=255)

    # Personal Information  
    first_name = StringField(required=True, max_length=100)
    last_name = StringField(required=True, max_length=100)
    phone_number = StringField(max_length=20)

    # Role (DIRECT field, not reference)
    role = StringField(
        required=True,
        max_length=20,
        default=RoleEnum.CUSTOMER.value,
        choices=[e.value for e in RoleEnum]
    )

    # Account Status
    is_active = BooleanField(default=True)
    is_verified = BooleanField(default=False)
    is_first_login = BooleanField(default=True)

    # MPIN Security
    mpin_hash = StringField(max_length=255)
    mpin_set = BooleanField(default=False)

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    last_login = DateTimeField()

    def to_dict(self, include_sensitive=False):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone_number": self.phone_number,
            "role": self.role,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "is_first_login": self.is_first_login,
            "mpin_set": self.mpin_set,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"


# For backward compatibility with old Role model
class Role(Document):
    """Legacy Role model - kept for migration compatibility"""
    meta = {'collection': 'roles'}
    
    name = StringField(required=True, unique=True, max_length=50)
    description = StringField(max_length=255)
    created_at = DateTimeField(default=datetime.utcnow)
