"""
Order, Payment, Review, PromoCode, and Delivery Models
"""
from mongoengine import Document, StringField, FloatField, ListField, DictField, ReferenceField, DateTimeField, IntField, BooleanField
from datetime import datetime

class Order(Document):
    """Order model"""

    customer = ReferenceField('User', required=True)
    restaurant = ReferenceField('Restaurant', required=True)
    delivery_partner = ReferenceField('User')  # Assigned later

    # Items in order
    items = ListField(DictField())  # [{'item_id': str, 'name': str, 'price': float, 'qty': int}]

    # Order details
    subtotal = FloatField(required=True)
    delivery_charge = FloatField(default=50)
    promo_discount = FloatField(default=0)
    tip_amount = FloatField(default=0)
    total_amount = FloatField(required=True)

    # Addresses
    delivery_address = StringField()
    special_instructions = StringField()

    # Order status
    status = StringField(
        required=True,
        choices=['placed', 'accepted', 'preparing', 'ready', 'waiting', 'assigned', 'picked', 'delivered', 'cancelled'],
        default='placed'
    )

    # Payment
    payment_method = StringField(choices=['razorpay', 'upi', 'cod'], default='cod')
    payment_status = StringField(choices=['pending', 'paid', 'failed', 'cod_pending'], default='cod_pending')
    razorpay_order_id = StringField()
    razorpay_payment_id = StringField()
    restaurant_upi_id = StringField()  # Snapshot of restaurant UPI ID at time of order

    # Tracking
    current_location = DictField()  # {'lat': float, 'lng': float}
    estimated_delivery = DateTimeField()

    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    delivered_at = DateTimeField()

    meta = {
        'collection': 'orders',
        'indexes': ['customer', 'restaurant', 'status'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'customer_id': str(self.customer.id),
            'customer_username': self.customer.username if self.customer else '',
            'restaurant_id': str(self.restaurant.id),
            'restaurant_name': self.restaurant.name if self.restaurant else '',
            'restaurant': str(self.restaurant.id),
            'delivery_partner_id': str(self.delivery_partner.id) if self.delivery_partner else None,
            'items': self.items,
            'subtotal': self.subtotal,
            'delivery_charge': self.delivery_charge,
            'promo_discount': self.promo_discount,
            'tip_amount': self.tip_amount,
            'total_amount': self.total_amount,
            'delivery_address': self.delivery_address,
            'special_instructions': self.special_instructions,
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'razorpay_order_id': self.razorpay_order_id,
            'restaurant_upi_id': self.restaurant_upi_id,
            'current_location': self.current_location,
            'estimated_delivery': self.estimated_delivery.isoformat() if self.estimated_delivery else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class Payment(Document):
    """Payment model"""

    order = ReferenceField(Order, required=True)
    amount = FloatField(required=True)
    method = StringField(choices=['card', 'upi', 'wallet', 'cash'], default='card')
    status = StringField(choices=['pending', 'completed', 'failed', 'refunded'], default='pending')

    # Payment gateway
    gateway = StringField()  # razorpay, stripe
    gateway_order_id = StringField()
    gateway_payment_id = StringField()

    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    completed_at = DateTimeField()

    meta = {
        'collection': 'payments',
        'indexes': ['order', 'status'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'order_id': str(self.order.id),
            'amount': self.amount,
            'method': self.method,
            'status': self.status,
            'gateway': self.gateway,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Review(Document):
    """Review and Rating model"""

    order = ReferenceField(Order, required=True)
    customer = ReferenceField('User', required=True)
    restaurant = ReferenceField('Restaurant', required=True)

    rating = IntField(required=True, min_value=1, max_value=5)
    review_text = StringField()

    # Review aspects
    food_quality = IntField()
    delivery_speed = IntField()
    packaging = IntField()

    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'reviews',
        'indexes': ['order', 'restaurant'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'order_id': str(self.order.id),
            'customer_id': str(self.customer.id),
            'restaurant_id': str(self.restaurant.id),
            'rating': self.rating,
            'review_text': self.review_text,
            'food_quality': self.food_quality,
            'delivery_speed': self.delivery_speed,
            'packaging': self.packaging,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class PromoCode(Document):
    """Promo code model"""

    code = StringField(required=True, unique=True, max_length=20)
    discount_type = StringField(choices=['percentage', 'fixed'], default='percentage')
    discount_value = FloatField(required=True)  # percentage or amount
    min_order_amount = FloatField(default=0)
    max_discount = FloatField()  # Cap on discount

    valid_from = DateTimeField()
    valid_till = DateTimeField()

    max_uses = IntField()  # Total uses
    max_uses_per_user = IntField(default=1)
    current_uses = IntField(default=0)

    applicable_restaurants = ListField()  # Empty = all
    is_active = BooleanField(default=True)

    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'promo_codes',
        'indexes': ['code', 'is_active'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'code': self.code,
            'discount_type': self.discount_type,
            'discount_value': self.discount_value,
            'min_order_amount': self.min_order_amount,
            'max_discount': self.max_discount,
            'valid_from': self.valid_from.isoformat() if self.valid_from else None,
            'valid_till': self.valid_till.isoformat() if self.valid_till else None,
            'is_active': self.is_active,
        }

class DeliveryAssignment(Document):
    """Delivery assignment tracking"""

    order = ReferenceField(Order, required=True)
    delivery_partner = ReferenceField('User', required=True)

    status = StringField(
        choices=['assigned', 'accepted', 'rejected', 'picked_up', 'delivered'],
        default='assigned'
    )

    # Location tracking
    current_location = DictField()  # {'lat': float, 'lng': float}
    pickup_location = DictField()
    delivery_location = DictField()

    # Times
    assigned_at = DateTimeField(default=datetime.utcnow)
    accepted_at = DateTimeField()
    picked_up_at = DateTimeField()
    delivered_at = DateTimeField()

    # Rating
    delivery_rating = IntField()

    meta = {
        'collection': 'delivery_assignments',
        'indexes': ['order', 'delivery_partner'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'order_id': str(self.order.id),
            'delivery_partner_id': str(self.delivery_partner.id),
            'status': self.status,
            'current_location': self.current_location,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
        }

class Notification(Document):
    """Notification model for system alerts"""

    recipient = ReferenceField('User', required=True)
    title = StringField(required=True)
    message = StringField(required=True)
    
    # type: info, success, warning, error, order, delivery
    type = StringField(default='info')
    
    is_read = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'notifications',
        'indexes': ['recipient', 'is_read', '-created_at'],
        'ordering': ['-created_at'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'recipient_id': str(self.recipient.id),
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class ChatMessage(Document):
    """Real-time chat message between customer and delivery partner"""
    order = ReferenceField('Order', required=True)
    sender = ReferenceField('User', required=True)
    message = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'chat_messages',
        'indexes': ['order'],
        'ordering': ['created_at'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'order_id': str(self.order.id),
            'sender_id': str(self.sender.id),
            'sender_name': self.sender.username,
            'message': self.message,
            'created_at': self.created_at.isoformat(),
        }
