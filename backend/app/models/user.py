"""
User Models - Customer, Restaurant, Delivery Partner
"""
from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField
from datetime import datetime

class User(Document):
    """User model for all roles"""

    username = StringField(required=True, unique=True, max_length=80)
    email = StringField(required=True, unique=True, max_length=120)
    password_hash = StringField(required=False)  # Can be None for Google auth users
    phone = StringField(required=True, max_length=20)

    # User type
    role = StringField(required=True, choices=['customer', 'restaurant', 'delivery', 'admin'], default='customer')

    # Profile
    full_name = StringField(max_length=100)
    profile_image = StringField()
    address = StringField()

    # Status
    is_verified = BooleanField(default=False)
    is_active = BooleanField(default=True)
    is_approved = BooleanField(default=False)  # Admin approval for restaurant/delivery

    # Google OAuth
    google_id = StringField(unique=True, sparse=True)  # For Google Sign-In users

    # Admin-generated password tracking
    password_generated_at = DateTimeField()

    # Preferences
    favorite_restaurants = ListField()
    saved_addresses = ListField()

    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    last_login = DateTimeField()
    last_activity = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'users',
        'indexes': ['username', 'email', 'role', 'last_activity'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'full_name': self.full_name,
            'profile_image': self.profile_image,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'is_approved': self.is_approved,
            'google_id': self.google_id,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None,
            'password_generated_at': self.password_generated_at.isoformat() if self.password_generated_at else None,
        }

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"
