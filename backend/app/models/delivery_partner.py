"""
Delivery Partner Model
"""
from mongoengine import Document, StringField, ReferenceField, BooleanField, DateTimeField, DictField, FloatField, IntField
from datetime import datetime
from backend.app.models.user import User


class DeliveryPartner(Document):
    """Delivery partner model"""
    
    user = ReferenceField(User, required=True, unique=True)
    phone = StringField(required=True, max_length=20)
    vehicle_type = StringField(required=True, choices=['bike', 'scooter', 'car', 'bicycle'])
    vehicle_number = StringField()
    
    # Status
    is_available = BooleanField(default=False)
    is_active = BooleanField(default=True)
    is_verified = BooleanField(default=False)
    
    # Location tracking
    current_location = DictField()  # {'lat': float, 'lng': float}
    
    # Stats
    total_deliveries = IntField(default=0)
    rating = FloatField(default=0.0)
    total_reviews = IntField(default=0)
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    last_online_at = DateTimeField()
    
    meta = {
        'collection': 'delivery_partners',
        'indexes': ['user', 'is_available', 'is_active'],
        'strict': False
    }
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user.id) if self.user else None,
            'phone': self.phone,
            'vehicle_type': self.vehicle_type,
            'vehicle_number': self.vehicle_number,
            'is_available': self.is_available,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'current_location': self.current_location,
            'total_deliveries': self.total_deliveries,
            'rating': self.rating,
            'total_reviews': self.total_reviews,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
    
    def __repr__(self):
        return f"<DeliveryPartner {self.user.username}>"
