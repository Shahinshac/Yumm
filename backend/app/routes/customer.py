"""
Customer Dashboard Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models.restaurant import Restaurant, MenuItem
from backend.app.models.models import Order
from backend.app.models.user import User
from backend.app.middleware.role_auth import customer_required
from backend.app.services.order_service import OrderService
from backend.app.utils.validators import Validators
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('customer', __name__, url_prefix='/api/customer')


@bp.route('/restaurants', methods=['GET'])
@customer_required
def get_restaurants():
    """Get all approved restaurants"""
    try:
        restaurants = Restaurant.objects(is_approved=True, is_active=True)
        return jsonify([r.to_dict() for r in restaurants]), 200
    except Exception as e:
        logger.error(f"Error fetching restaurants: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/restaurants/<restaurant_id>', methods=['GET'])
@customer_required
def get_restaurant_details(restaurant_id):
    """Get restaurant details and menu"""
    try:
        restaurant = Restaurant.objects(id=restaurant_id, is_approved=True).first()
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404
        
        menu_items = MenuItem.objects(restaurant=restaurant_id, is_available=True)
        
        return jsonify({
            'restaurant': restaurant.to_dict(),
            'menu': [item.to_dict() for item in menu_items]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching restaurant: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/place', methods=['POST'])
@customer_required
def place_order():
    """Place new order"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate input
        if not data.get('restaurant_id') or not data.get('items'):
            return jsonify({'error': 'restaurant_id and items required'}), 400
        
        if not isinstance(data['items'], list) or len(data['items']) == 0:
            return jsonify({'error': 'items must be non-empty array'}), 400
        
        # Validate coordinates
        if data.get('delivery_lat') and data.get('delivery_lng'):
            if not Validators.validate_coordinates(data['delivery_lat'], data['delivery_lng']):
                return jsonify({'error': 'Invalid delivery coordinates'}), 400
        
        restaurant = Restaurant.objects(id=data['restaurant_id'], is_approved=True).first()
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404
        
        # Calculate total
        total_amount = data.get('total_amount', 0)
        
        order, error = OrderService.create_order(
            customer_id=user_id,
            restaurant_id=data['restaurant_id'],
            items=data['items'],
            total_amount=total_amount,
            delivery_address=data.get('delivery_address', ''),
            special_instructions=data.get('special_instructions', '')
        )
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Order placed successfully',
            'order': order.to_dict()
        }), 201
    except Exception as e:
        logger.error(f"Error placing order: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders', methods=['GET'])
@customer_required
def get_my_orders():
    """Get customer's orders"""
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        orders = Order.objects(customer=user)
        return jsonify([order.to_dict() for order in orders]), 200
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>', methods=['GET'])
@customer_required
def get_order_details(order_id):
    """Get order details and track"""
    try:
        user_id = get_jwt_identity()
        order = Order.objects(id=order_id).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Verify ownership
        if str(order.customer.id) != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify(order.to_dict()), 200
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>/cancel', methods=['POST'])
@customer_required
def cancel_order(order_id):
    """Cancel order"""
    try:
        user_id = get_jwt_identity()
        order = Order.objects(id=order_id).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        if str(order.customer.id) != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        if order.status in ['delivered', 'cancelled']:
            return jsonify({'error': f'Cannot cancel order with status {order.status}'}), 400
        
        updated_order, error = OrderService.update_order_status(order_id, 'cancelled')
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Order cancelled',
            'order': updated_order.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error cancelling order: {str(e)}")
        return jsonify({'error': str(e)}), 500
