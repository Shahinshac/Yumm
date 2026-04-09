"""
Delivery Partner Dashboard Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models.user import User
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.middleware.role_auth import delivery_required
from backend.app.services.delivery_service import DeliveryService
from backend.app.utils.validators import Validators
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('delivery_dashboard', __name__, url_prefix='/api/delivery-dashboard')


@bp.route('/register', methods=['POST'])
@jwt_required()
def register_delivery():
    """Register as delivery partner"""
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user or user.role != 'delivery':
            return jsonify({'error': 'Unauthorized. Must be registered as delivery partner'}), 403
        
        data = request.get_json()
        
        # Validate input
        required = ['phone', 'vehicle_type']
        if not all(data.get(f) for f in required):
            return jsonify({'error': 'phone and vehicle_type required'}), 400
        
        if not Validators.validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number'}), 400
        
        if not Validators.validate_vehicle_type(data['vehicle_type']):
            return jsonify({'error': 'Invalid vehicle type'}), 400
        
        partner, error = DeliveryService.register_delivery_partner(
            user_id=user_id,
            phone=data['phone'],
            vehicle_type=data['vehicle_type'],
            vehicle_number=data.get('vehicle_number', '')
        )
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Delivery partner registered',
            'partner': partner.to_dict()
        }), 201
    except Exception as e:
        logger.error(f"Error registering delivery partner: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/profile', methods=['GET'])
@delivery_required
def get_profile():
    """Get delivery partner profile"""
    try:
        user_id = get_jwt_identity()
        partner, error = DeliveryService.get_delivery_partner_by_user(user_id)
        
        if error or not partner:
            return jsonify({'error': 'Delivery partner not found'}), 404
        
        return jsonify(partner), 200
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/availability', methods=['POST'])
@delivery_required
def toggle_availability():
    """Toggle online/offline status"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        is_available = data.get('is_available')
        if is_available is None:
            return jsonify({'error': 'is_available required'}), 400
        
        result, error = DeliveryService.toggle_availability(user_id, is_available)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error toggling availability: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/location', methods=['POST'])
@delivery_required
def update_location():
    """Update current location"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        lat = data.get('lat')
        lng = data.get('lng')
        
        if lat is None or lng is None:
            return jsonify({'error': 'lat and lng required'}), 400
        
        if not Validators.validate_coordinates(lat, lng):
            return jsonify({'error': 'Invalid coordinates'}), 400
        
        partner, error = DeliveryService.update_location(user_id, lat, lng)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Location updated',
            'partner': partner
        }), 200
    except Exception as e:
        logger.error(f"Error updating location: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders', methods=['GET'])
@delivery_required
def get_assigned_orders():
    """Get assigned orders"""
    try:
        user_id = get_jwt_identity()
        orders, error = DeliveryService.get_assigned_orders(user_id)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify(orders or []), 200
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>', methods=['GET'])
@delivery_required
def get_order(order_id):
    """Get order details"""
    try:
        from backend.app.models.models import Order
        order = Order.objects(id=order_id).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify(order.to_dict()), 200
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/available', methods=['GET'])
@delivery_required
def get_available_orders():
    """Get orders available for pickup"""
    try:
        orders, error = DeliveryService.get_available_orders()
        if error:
            return jsonify({'error': error}), 400
        return jsonify(orders or []), 200
    except Exception as e:
        logger.error(f"Error fetching available orders: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>/claim', methods=['POST'])
@delivery_required
def claim_order(order_id):
    """Claim an order for delivery"""
    try:
        user_id = get_jwt_identity()
        order, error = DeliveryService.claim_order(order_id, user_id)
        if error:
            return jsonify({'error': error}), 400
        return jsonify({'message': 'Order claimed successfully', 'order': order}), 200
    except Exception as e:
        logger.error(f"Error claiming order: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>/status', methods=['PUT'])
@delivery_required
def update_delivery_status(order_id):
    """Update delivery status"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        status_map = {
            'pickup': 'picked',
            'delivering': 'on_the_way',
            'done': 'delivered'
        }
        
        target_status = status_map.get(data.get('status'), data.get('status'))
        
        order, error = DeliveryService.update_delivery_status(order_id, target_status)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': f'Delivery status updated to {target_status}',
            'order': order
        }), 200
    except Exception as e:
        logger.error(f"Error updating status: {str(e)}")
        return jsonify({'error': str(e)}), 500
