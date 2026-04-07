"""
Order Service - Business logic for order management
"""
from datetime import datetime
from backend.app.models.models import Order, DeliveryAssignment
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.models.restaurant import Restaurant
from backend.app.models.user import User
from backend.app.services.notification_service import NotificationService


class OrderService:
    """Handle order operations"""
    
    @staticmethod
    def create_order(customer_id: str, restaurant_id: str, items: list, total_amount: float, delivery_address: str, special_instructions: str = ""):
        """Create a new order"""
        try:
            customer = User.objects(id=customer_id).first()
            restaurant = Restaurant.objects(id=restaurant_id).first()
            
            if not customer or not restaurant:
                return None, "Customer or restaurant not found"
            
            order = Order(
                customer=customer,
                restaurant=restaurant,
                items=items,
                subtotal=sum(item['price'] * item['qty'] for item in items),
                delivery_charge=50,
                total_amount=total_amount,
                delivery_address=delivery_address,
                special_instructions=special_instructions,
                status='placed'
            )
            order.save()
            
            NotificationService.order_placed(
                str(order.id),
                customer.full_name or customer.username,
                restaurant.name
            )
            
            return order, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def accept_order(order_id: str):
        """Accept order (restaurant)"""
        try:
            order = Order.objects(id=order_id).first()
            if not order:
                return None, "Order not found"
            
            order.status = 'accepted'
            order.updated_at = datetime.utcnow()
            order.save()
            
            NotificationService.order_accepted(
                str(order.id),
                order.restaurant.name
            )
            
            # Assign delivery partner
            delivery_partner = DeliveryPartner.objects(is_available=True, is_active=True).first()
            if delivery_partner:
                OrderService.assign_delivery(order_id, str(delivery_partner.user.id))
            
            return order, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def reject_order(order_id: str, reason: str = ""):
        """Reject order (restaurant)"""
        try:
            order = Order.objects(id=order_id).first()
            if not order:
                return None, "Order not found"
            
            order.status = 'cancelled'
            order.updated_at = datetime.utcnow()
            order.save()
            
            NotificationService.order_rejected(
                str(order.id),
                order.restaurant.name,
                reason
            )
            
            return order, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def update_order_status(order_id: str, new_status: str):
        """Update order status"""
        valid_statuses = ['placed', 'accepted', 'preparing', 'picked', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return None, f"Invalid status. Must be one of {valid_statuses}"
        
        try:
            order = Order.objects(id=order_id).first()
            if not order:
                return None, "Order not found"
            
            order.status = new_status
            order.updated_at = datetime.utcnow()
            
            if new_status == 'delivered':
                order.delivered_at = datetime.utcnow()
            
            order.save()
            return order, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def assign_delivery(order_id: str, delivery_partner_id: str):
        """Assign delivery partner to order"""
        try:
            order = Order.objects(id=order_id).first()
            delivery_partner = DeliveryPartner.objects(user=delivery_partner_id).first()
            
            if not order or not delivery_partner:
                return None, "Order or delivery partner not found"
            
            order.delivery_partner = delivery_partner.user
            order.save()
            
            # Mark as unavailable
            delivery_partner.is_available = False
            delivery_partner.save()
            
            # Create delivery assignment
            assignment = DeliveryAssignment(
                order=order,
                delivery_partner=delivery_partner.user
            )
            assignment.save()
            
            NotificationService.delivery_assigned(
                str(order.id),
                delivery_partner.user.full_name or delivery_partner.user.username
            )
            
            return order, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def get_order_by_id(order_id: str):
        """Get order details"""
        try:
            order = Order.objects(id=order_id).first()
            return order.to_dict() if order else None, None
        except Exception as e:
            return None, str(e)
