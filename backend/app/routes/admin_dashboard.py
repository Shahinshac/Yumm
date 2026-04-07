"""
Admin Dashboard Routes
"""
from flask import Blueprint, request, jsonify
from backend.app.models.restaurant import Restaurant
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.middleware.role_auth import admin_required
from backend.app.services.restaurant_service import RestaurantService
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('admin_dashboard', __name__, url_prefix='/api/admin-dashboard')


@bp.route('/restaurants/pending', methods=['GET'])
@admin_required
def get_pending_restaurants():
    """Get pending restaurant approvals"""
    try:
        restaurants = Restaurant.objects(is_approved=False)
        return jsonify([r.to_dict() for r in restaurants]), 200
    except Exception as e:
        logger.error(f"Error fetching pending restaurants: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/restaurants/approved', methods=['GET'])
@admin_required
def get_approved_restaurants():
    """Get approved restaurants"""
    try:
        restaurants = Restaurant.objects(is_approved=True)
        return jsonify([r.to_dict() for r in restaurants]), 200
    except Exception as e:
        logger.error(f"Error fetching approved restaurants: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/restaurants/<restaurant_id>/approve', methods=['POST'])
@admin_required
def approve_restaurant(restaurant_id):
    """Approve restaurant"""
    try:
        restaurant, error = RestaurantService.approve_restaurant(restaurant_id)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Restaurant approved',
            'restaurant': restaurant.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error approving restaurant: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/restaurants/<restaurant_id>/reject', methods=['POST'])
@admin_required
def reject_restaurant(restaurant_id):
    """Reject restaurant"""
    try:
        data = request.get_json() or {}
        reason = data.get('reason', 'Not specified')
        
        restaurant, error = RestaurantService.reject_restaurant(restaurant_id, reason)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Restaurant rejected',
            'restaurant': restaurant.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error rejecting restaurant: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/delivery-partners', methods=['GET'])
@admin_required
def get_delivery_partners():
    """Get all delivery partners"""
    try:
        partners = DeliveryPartner.objects()
        return jsonify([p.to_dict() for p in partners]), 200
    except Exception as e:
        logger.error(f"Error fetching delivery partners: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/delivery-partners/<partner_id>/verify', methods=['POST'])
@admin_required
def verify_delivery_partner(partner_id):
    """Verify delivery partner"""
    try:
        partner = DeliveryPartner.objects(id=partner_id).first()
        
        if not partner:
            return jsonify({'error': 'Delivery partner not found'}), 404
        
        partner.is_verified = True
        partner.save()
        
        return jsonify({
            'message': 'Delivery partner verified',
            'partner': partner.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error verifying delivery partner: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    """Get platform statistics"""
    try:
        from backend.app.models.restaurant import Restaurant
        from backend.app.models.models import Order
        from backend.app.models.user import User
        
        stats = {
            'total_restaurants': Restaurant.objects().count(),
            'approved_restaurants': Restaurant.objects(is_approved=True).count(),
            'pending_restaurants': Restaurant.objects(is_approved=False).count(),
            'total_delivery_partners': DeliveryPartner.objects().count(),
            'available_delivery_partners': DeliveryPartner.objects(is_available=True).count(),
            'total_users': User.objects().count(),
            'total_orders': Order.objects().count(),
            'orders_by_status': {
                'placed': Order.objects(status='placed').count(),
                'accepted': Order.objects(status='accepted').count(),
                'preparing': Order.objects(status='preparing').count(),
                'picked': Order.objects(status='picked').count(),
                'delivered': Order.objects(status='delivered').count(),
                'cancelled': Order.objects(status='cancelled').count(),
            }
        }
        
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        return jsonify({'error': str(e)}), 500
