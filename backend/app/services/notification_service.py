"""
Notification Service - Console based for now
"""
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class NotificationService:
    """Handle all notifications"""
    
    @staticmethod
    def log_notification(message: str, notification_type: str = "INFO"):
        """Log notification to console"""
        timestamp = datetime.utcnow().isoformat()
        log_message = f"[{timestamp}] [{notification_type}] {message}"
        
        if notification_type == "ERROR":
            logger.error(log_message)
        elif notification_type == "WARNING":
            logger.warning(log_message)
        else:
            logger.info(log_message)
        
        return log_message
    
    @staticmethod
    def order_placed(order_id: str, customer_name: str, restaurant_name: str):
        """Notify order placed"""
        return NotificationService.log_notification(
            f"Order {order_id} placed by {customer_name} at {restaurant_name}",
            "ORDER"
        )
    
    @staticmethod
    def order_accepted(order_id: str, restaurant_name: str):
        """Notify order accepted"""
        return NotificationService.log_notification(
            f"Order {order_id} accepted by {restaurant_name}",
            "ORDER"
        )
    
    @staticmethod
    def order_rejected(order_id: str, restaurant_name: str, reason: str = ""):
        """Notify order rejected"""
        msg = f"Order {order_id} rejected by {restaurant_name}"
        if reason:
            msg += f" - {reason}"
        return NotificationService.log_notification(msg, "ORDER")
    
    @staticmethod
    def delivery_assigned(order_id: str, delivery_partner_name: str):
        """Notify delivery assigned"""
        return NotificationService.log_notification(
            f"Delivery partner {delivery_partner_name} assigned to order {order_id}",
            "DELIVERY"
        )
    
    @staticmethod
    def delivery_picked_up(order_id: str, delivery_partner_name: str):
        """Notify pickup"""
        return NotificationService.log_notification(
            f"{delivery_partner_name} picked up order {order_id}",
            "DELIVERY"
        )
    
    @staticmethod
    def delivery_delivered(order_id: str, delivery_partner_name: str):
        """Notify delivery completed"""
        return NotificationService.log_notification(
            f"Order {order_id} delivered by {delivery_partner_name}",
            "DELIVERY"
        )
    
    @staticmethod
    def restaurant_approved(restaurant_name: str):
        """Notify restaurant approved"""
        return NotificationService.log_notification(
            f"Restaurant {restaurant_name} approved by admin",
            "ADMIN"
        )
    
    @staticmethod
    def restaurant_rejected(restaurant_name: str, reason: str = ""):
        """Notify restaurant rejected"""
        msg = f"Restaurant {restaurant_name} rejected"
        if reason:
            msg += f" - {reason}"
        return NotificationService.log_notification(msg, "ADMIN")
