"""
Notification Routes
"""
from flask import Blueprint, jsonify, request
from backend.app.models.models import Notification
from backend.app.middleware.auth import required_auth
from flask_jwt_extended import get_jwt_identity
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@bp.route('', methods=['GET'])
@required_auth
def get_notifications():
    """Get notifications for current user"""
    try:
        user_id = get_jwt_identity()
        notifications = Notification.objects(recipient=user_id).order_by('-created_at').limit(50)
        
        unread_count = Notification.objects(recipient=user_id, is_read=False).count()
        
        return jsonify({
            'notifications': [n.to_dict() for n in notifications],
            'unread_count': unread_count
        }), 200
    except Exception as e:
        logger.error(f"Error fetching notifications: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/read-all', methods=['PUT'])
@required_auth
def mark_all_read():
    """Mark all notifications as read for current user"""
    try:
        user_id = get_jwt_identity()
        Notification.objects(recipient=user_id, is_read=False).update(set__is_read=True)
        return jsonify({'message': 'All notifications marked as read'}), 200
    except Exception as e:
        logger.error(f"Error marking notifications read: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<notif_id>/read', methods=['PUT'])
@required_auth
def mark_read(notif_id):
    """Mark specific notification as read"""
    try:
        user_id = get_jwt_identity()
        notification = Notification.objects(id=notif_id, recipient=user_id).first()
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
            
        notification.is_read = True
        notification.save()
        return jsonify({'message': 'Notification marked as read'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
