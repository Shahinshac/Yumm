"""
User Models - Customer, Restaurant, Delivery Partner
"""
from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField
from datetime import datetime

class User(Document):
    """User model for all roles"""

    username = StringField(required=True, unique=True, max_length=80)
    email = StringField(required=True, unique=True, max_length=120)
    password_hash = StringField(required=True)
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

    # Preferences
    favorite_restaurants = ListField()
    saved_addresses = ListField()

    # Metadata
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
            'phone': self.phone,
            'role': self.role,
            'full_name': self.full_name,
            'profile_image': self.profile_image,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"
