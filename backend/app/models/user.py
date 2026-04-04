"""
User and Role database models using MongoEngine
"""
from mongoengine import Document, StringField, BooleanField, DateTimeField, ReferenceField, ListField
from datetime import datetime
from enum import Enum


class RoleEnum(Enum):
    """User roles in the banking system"""
    ADMIN = "admin"
    MANAGER = "manager"
    STAFF = "staff"
    CUSTOMER = "customer"


class Role(Document):
    """Role model for RBAC"""
    meta = {
        'collection': 'roles',
        'indexes': ['name']
    }

    name = StringField(required=True, unique=True, max_length=50)
    description = StringField(max_length=255)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Role {self.name}>"


class User(Document):
    """User model"""
    meta = {
        'collection': 'users',
        'indexes': [
            'username',
            'email',
            'phone_number'
        ]
    }

    username = StringField(required=True, unique=True, max_length=80)
    email = StringField(required=True, unique=True, max_length=120)
    password_hash = StringField(required=True, max_length=255)

    # Personal Information
    first_name = StringField(required=True, max_length=100)
    last_name = StringField(required=True, max_length=100)
    phone_number = StringField(required=True, unique=True, max_length=20)

    # Account Status
    is_active = BooleanField(default=True)
    is_verified = BooleanField(default=False)
    is_first_login = BooleanField(default=True)

    # Role Reference
    role = ReferenceField(Role, required=True)

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    last_login = DateTimeField()

    def to_dict(self, include_sensitive=False):
        """Convert to dictionary"""
        data = {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone_number": self.phone_number,
            "role": self.role.name if self.role else None,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "is_first_login": self.is_first_login,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
        return data

    def __repr__(self):
        return f"<User {self.username}>"
