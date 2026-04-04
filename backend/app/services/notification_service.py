"""Notification Service - Handle in-app notifications"""
from app import db
from app.models.base import Notification
from app.models.user import User
from app.utils.exceptions import ResourceNotFoundError
from datetime import datetime

class NotificationService:
    @staticmethod
    def create_notification(user_id, title, message):
        """Create a notification"""
        user = User.query.get(user_id)
        if not user:
            raise ResourceNotFoundError(f"User {user_id} not found")
        
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            is_read=False,
        )
        db.session.add(notif)
        db.session.commit()
        return notif

    @staticmethod
    def get_notification(notif_id):
        """Get notification by ID"""
        notif = Notification.query.get(notif_id)
        if not notif:
            raise ResourceNotFoundError(f"Notification {notif_id} not found")
        return notif

    @staticmethod
    def get_user_notifications(user_id, unread_only=False):
        """Get user's notifications"""
        query = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc())
        if unread_only:
            query = query.filter_by(is_read=False)
        return query.all()

    @staticmethod
    def mark_as_read(notif_id):
        """Mark notification as read"""
        notif = NotificationService.get_notification(notif_id)
        notif.is_read = True
        db.session.commit()
        return notif

    @staticmethod
    def mark_all_as_read(user_id):
        """Mark all notifications as read"""
        Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
        db.session.commit()
        return {"message": "All marked as read"}

    @staticmethod
    def delete_notification(notif_id):
        """Delete a notification"""
        notif = NotificationService.get_notification(notif_id)
        db.session.delete(notif)
        db.session.commit()
        return {"message": "Deleted"}

    @staticmethod
    def get_statistics(user_id):
        """Get notification stats"""
        total = Notification.query.filter_by(user_id=user_id).count()
        unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        return {
            "total": total,
            "unread": unread,
            "read": total - unread
        }

    @staticmethod
    def send_transaction_notification(user_id, transaction_type, amount, account_number=None):
        """Send transaction notification"""
        title = f"{transaction_type.title()} Alert"
        message = f"Transaction of {amount} completed"
        if account_number:
            message += f" on account {account_number[-4:]}"
        return NotificationService.create_notification(user_id, title, message)

    @staticmethod
    def send_approval_notification(user_id, item_type, status):
        """Send approval notification"""
        title = f"{item_type.title()} {status.title()}"
        message = f"Your {item_type} has been {status}"
        return NotificationService.create_notification(user_id, title, message)
