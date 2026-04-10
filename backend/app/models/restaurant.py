"""
Restaurant and Menu Models
"""
from mongoengine import Document, StringField, FloatField, DictField, ListField, ReferenceField, DateTimeField, IntField, BooleanField
from datetime import datetime

class Restaurant(Document):
    """Restaurant model"""
    
    user = ReferenceField('User')  # Link to user account
    
    name = StringField(required=True, max_length=100)
    category = StringField(required=False)  # No longer required during registration
    location = DictField()  # {'lat': 28.6139, 'lng': 77.2090}
    address = StringField()
    phone = StringField()
    image = StringField()  # Emoji or image URL
    license_number = StringField(max_length=50)

    # Stats
    rating = FloatField(default=0.0)
    total_reviews = IntField(default=0)
    delivery_time = IntField(default=30)  # minutes
    min_order = FloatField(default=0)
    delivery_charge = FloatField(default=50)

    # Status
    is_open = BooleanField(default=True)
    is_verified = BooleanField(default=False)
    is_approved = BooleanField(default=False)  # Admin approval
    is_active = BooleanField(default=True)

    # Offers System
    special_offer = StringField(max_length=200) # Message like "10% off"
    offer_active = BooleanField(default=False)

    # Payment
    upi_id = StringField(max_length=100)  # e.g. restaurant@upi

    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    approved_at = DateTimeField()

    meta = {
        'collection': 'restaurants',
        'indexes': ['name', 'user', 'is_approved', 'offer_active'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user.id) if self.user else None,
            'name': self.name,
            'category': self.category,
            'address': self.address,
            'location': self.location,
            'rating': self.rating,
            'total_reviews': self.total_reviews,
            'delivery_time': self.delivery_time,
            'min_order': self.min_order,
            'delivery_charge': self.delivery_charge,
            'image': self.image,
            'license_number': self.license_number,
            'is_open': self.is_open,
            'is_verified': self.is_verified,
            'is_approved': self.is_approved,
            'is_active': self.is_active,
            'special_offer': self.special_offer,
            'offer_active': self.offer_active,
            'upi_id': self.upi_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class MenuItem(Document):
    """Menu item model"""

    restaurant = ReferenceField(Restaurant, required=True)
    name = StringField(required=True, max_length=100)
    description = StringField()
    price = FloatField(required=True)
    category = StringField()  # Veg, Non-Veg, Dessert
    image = StringField()
    is_available = BooleanField(default=True)
    is_veg = BooleanField(default=True)

    # Stats
    total_orders = IntField(default=0)
    rating = FloatField(default=0.0)

    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'menu_items',
        'indexes': ['restaurant', 'name'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'restaurant_id': str(self.restaurant.id),
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'category': self.category,
            'image': self.image,
            'is_available': self.is_available,
            'is_veg': self.is_veg,
            'total_orders': self.total_orders,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
