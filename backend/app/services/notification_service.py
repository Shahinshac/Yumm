"""
Notification Service - DB Persistence & Role-based Routing
"""
import logging
from datetime import datetime
from backend.app.models.models import Notification
from backend.app.models.user import User

logger = logging.getLogger(__name__)


class NotificationService:
    """Handle all notifications with DB persistence"""
    
    @staticmethod
    def create_notification(recipient, title, message, n_type="info"):
        """Save notification to database"""
        try:
            notification = Notification(
                recipient=recipient,
                title=title,
                message=message,
                type=n_type
            )
            notification.save()
            return True
        except Exception as e:
            logger.error(f"Failed to create notification: {str(e)}")
            return False

    @staticmethod
    def notify_admins(title, message, n_type="admin"):
        """Broadcast notification to all admins"""
        admins = User.objects(role='admin')
        for admin in admins:
            NotificationService.create_notification(admin, title, message, n_type)

    @staticmethod
    def log_notification(message: str, notification_type: str = "INFO"):
        """Legacy log method - maintains compatibility while logging to console"""
        logger.info(f"[{notification_type}] {message}")
        return message
    
    @staticmethod
    def order_placed(order_id: str, customer_name: str, restaurant_id: str, restaurant_name: str):
        """Notify restaurant on new order"""
        from backend.app.models.restaurant import Restaurant
        rest = Restaurant.objects(id=restaurant_id).first()
        if rest and rest.user:
            NotificationService.create_notification(
                rest.user, 
                "New Order Received!", 
                f"Order {order_id} placed by {customer_name}.",
                "order"
            )
        return f"Notification triggered for Order {order_id}"
    
    @staticmethod
    def order_accepted(order_id: str, restaurant_name: str, customer_id: str):
        """Notify customer on order acceptance"""
        user = User.objects(id=customer_id).first()
        if user:
            NotificationService.create_notification(
                user,
                "Order Accepted!",
                f"Your order {order_id} has been accepted by {restaurant_name}.",
                "success"
            )
    
    @staticmethod
    def order_rejected(order_id: str, restaurant_name: str, customer_id: str, reason: str = ""):
        """Notify customer on order rejection"""
        user = User.objects(id=customer_id).first()
        if user:
            msg = f"Your order {order_id} was rejected by {restaurant_name}."
            if reason: msg += f" Reason: {reason}"
            NotificationService.create_notification(user, "Order Cancelled", msg, "error")
    
    @staticmethod
    def delivery_assigned(order_id: str, delivery_partner_id: str, customer_id: str):
        """Notify customer and partner on assignment"""
        partner_user = User.objects(id=delivery_partner_id).first()
        if partner_user:
            NotificationService.create_notification(
                partner_user, 
                "New Delivery Assigned!", 
                f"You have been assigned to order {order_id}.",
                "delivery"
            )
        
        customer = User.objects(id=customer_id).first()
        if customer:
             NotificationService.create_notification(
                customer, 
                "Delivery Partner Assigned", 
                f"A delivery partner has been assigned to your order {order_id}.",
                "info"
            )
    
    @staticmethod
    def restaurant_registered(restaurant_name: str):
        """Notify admins on new restaurant registration"""
        NotificationService.notify_admins(
            "New Restaurant Registration",
            f"Restaurant '{restaurant_name}' is waiting for your approval.",
            "admin"
        )
