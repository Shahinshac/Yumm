"""
User Model - RBAC System
"""
from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField, ReferenceField
from datetime import datetime

class User(Document):
    """User model with role-based access control"""

    username = StringField(required=True, unique=True, max_length=80)
    email = StringField(required=True, unique=True, max_length=120)
    password_hash = StringField(required=True)

    first_name = StringField(required=True, max_length=100)
    last_name = StringField(required=True, max_length=100)
    phone_number = StringField(max_length=20)

    role = StringField(required=True, choices=['admin', 'staff', 'customer'], default='customer')

    is_active = BooleanField(default=True)
    is_verified = BooleanField(default=False)
    is_first_login = BooleanField(default=True)
    mpin_set = BooleanField(default=False)

    created_at = DateTimeField(default=datetime.utcnow)
    last_login = DateTimeField()

    meta = {
        'collection': 'users',
        'indexes': ['username', 'email', 'role'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone_number': self.phone_number,
            'role': self.role,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'is_first_login': self.is_first_login,
            'mpin_set': self.mpin_set,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"
