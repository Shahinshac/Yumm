"""
Restaurant and Menu Models
"""
from mongoengine import Document, StringField, FloatField, DictField, ListField, ReferenceField, DateTimeField, IntField, BooleanField
from datetime import datetime

class Restaurant(Document):
    """Restaurant model"""

    name = StringField(required=True, max_length=100)
    category = StringField(required=True)  # Pizza, Burger, Indian, etc
    location = DictField()  # {'lat': 28.6139, 'lng': 77.2090}
    address = StringField()
    phone = StringField()
    image = StringField()  # Emoji or image URL

    # Stats
    rating = FloatField(default=0.0)
    total_reviews = IntField(default=0)
    delivery_time = IntField(default=30)  # minutes
    min_order = FloatField(default=0)
    delivery_charge = FloatField(default=50)

    # Status
    is_open = BooleanField(default=True)
    is_verified = BooleanField(default=False)

    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'restaurants',
        'indexes': ['name', 'category'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
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
            'is_open': self.is_open,
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
