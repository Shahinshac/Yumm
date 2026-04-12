"""
Restaurant Dashboard Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models.restaurant import Restaurant, MenuItem
from backend.app.models.models import Order
from backend.app.models.user import User
from backend.app.middleware.role_auth import restaurant_required, restaurant_approved_required
from backend.app.services.restaurant_service import RestaurantService
from backend.app.services.order_service import OrderService
from backend.app.utils.validators import Validators
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('restaurant_dashboard', __name__, url_prefix='/api/restaurant-dashboard')


@bp.route('/register', methods=['POST'])
@jwt_required()
def register_restaurant():
    """Register as restaurant (must have restaurant role)"""
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user or user.role != 'restaurant':
            return jsonify({'error': 'Unauthorized. Must be registered as restaurant'}), 403
        
        data = request.get_json()
        
        # Validate input
        required = ['name', 'address', 'phone']
        if not all(data.get(f) for f in required):
            return jsonify({'error': 'name, address, phone required'}), 400
        
        if not Validators.validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number'}), 400
        
        restaurant, error = RestaurantService.register_restaurant(
            user_id=user_id,
            name=data['name'],
            address=data['address'],
            phone=data['phone'],
            license_number=data.get('license_number', '')
        )
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Restaurant registered. Awaiting admin approval.',
            'restaurant': restaurant.to_dict()
        }), 201
    except Exception as e:
        logger.error(f"Error registering restaurant: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/profile', methods=['GET'])
@restaurant_approved_required
def get_restaurant_profile():
    """Get restaurant profile"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404
        
        return jsonify(restaurant.to_dict()), 200
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/menu', methods=['GET'])
@restaurant_approved_required
def get_menu():
    """Get restaurant menu"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404
        
        items = MenuItem.objects(restaurant=restaurant.id)
        return jsonify([item.to_dict() for item in items]), 200
    except Exception as e:
        logger.error(f"Error fetching menu: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/menu/add', methods=['POST'])
@restaurant_approved_required
def add_menu_item():
    """Add menu item"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404
        
        data = request.get_json()
        
        # Validate input
        if not data.get('name') or not data.get('price'):
            return jsonify({'error': 'name and price required'}), 400
        
        try:
            price = float(data['price'])
            if price <= 0:
                return jsonify({'error': 'Price must be positive'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid price'}), 400
        
        item, error = RestaurantService.add_menu_item(
            restaurant_id=str(restaurant.id),
            name=Validators.sanitize_string(data['name']),
            price=price,
            description=Validators.sanitize_string(data.get('description', '')),
            category=data.get('category', 'General'),
            is_veg=data.get('is_veg', True)
        )
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Menu item added',
            'item': item.to_dict()
        }), 201
    except Exception as e:
        logger.error(f"Error adding menu item: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/menu/<item_id>/update', methods=['PUT'])
@restaurant_approved_required
def update_menu_item(item_id):
    """Update menu item"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        item, error = RestaurantService.update_menu_item(
            item_id=item_id,
            name=data.get('name'),
            price=data.get('price'),
            is_available=data.get('is_available')
        )
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Menu item updated',
            'item': item.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error updating menu item: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/menu/<item_id>/delete', methods=['DELETE'])
@restaurant_approved_required
def delete_menu_item(item_id):
    """Delete menu item"""
    try:
        result, error = RestaurantService.delete_menu_item(item_id)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error deleting menu item: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders', methods=['GET'])
@restaurant_approved_required
def get_orders():
    """Get all orders for restaurant"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404
        
        status = request.args.get('status')
        query = Order.objects(restaurant=restaurant.id)
        
        if status:
            query = query(status=status)
        
        orders = query.order_by('-created_at')
        return jsonify({
            'success': True,
            'orders': [order.to_dict() for order in orders],
            'count': query.count()
        }), 200
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>', methods=['GET'])
@restaurant_approved_required
def get_order(order_id):
    """Get order details"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        order = Order.objects(id=order_id).first()
        
        if not order or str(order.restaurant.id) != str(restaurant.id):
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify(order.to_dict()), 200
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>/accept', methods=['POST'])
@restaurant_approved_required
def accept_order(order_id):
    """Accept order"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        order = Order.objects(id=order_id).first()
        
        if not order or str(order.restaurant.id) != str(restaurant.id):
            return jsonify({'error': 'Order not found'}), 404
        
        updated_order, error = OrderService.accept_order(order_id)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Order accepted',
            'order': updated_order.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error accepting order: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>/reject', methods=['POST'])
@restaurant_approved_required
def reject_order(order_id):
    """Reject order"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        order = Order.objects(id=order_id).first()
        
        if not order or str(order.restaurant.id) != str(restaurant.id):
            return jsonify({'error': 'Order not found'}), 404
        
        data = request.get_json() or {}
        reason = data.get('reason', '')
        
        updated_order, error = OrderService.reject_order(order_id, reason)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Order rejected',
            'order': updated_order.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error rejecting order: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>/status', methods=['PUT'])
@restaurant_approved_required
def update_order_status(order_id):
    """Update order status"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        order = Order.objects(id=order_id).first()
        
        if not order or str(order.restaurant.id) != str(restaurant.id):
            return jsonify({'error': 'Order not found'}), 404
        
        data = request.get_json()
        if not data.get('status'):
            return jsonify({'error': 'status required'}), 400
        
        updated_order, error = OrderService.update_order_status(order_id, data['status'])
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Order status updated',
            'order': updated_order.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/profile/update', methods=['PUT'])
@restaurant_approved_required
def update_profile():
    """Update restaurant profile"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        
        if not restaurant:
            return jsonify({'error': 'Restaurant not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            restaurant.name = Validators.sanitize_string(data['name'])
        if 'address' in data:
            restaurant.address = Validators.sanitize_string(data['address'])
        if 'phone' in data:
            if Validators.validate_phone(data['phone']):
                restaurant.phone = data['phone']
        if 'min_order' in data:
            restaurant.min_order = float(data['min_order'])
        if 'delivery_time' in data:
            restaurant.delivery_time = int(data['delivery_time'])
        if 'is_open' in data:
            restaurant.is_open = bool(data['is_open'])
            
        # New Offer Fields
        if 'special_offer' in data:
            restaurant.special_offer = Validators.sanitize_string(data['special_offer'])
        if 'offer_active' in data:
            restaurant.offer_active = bool(data['offer_active'])

        # UPI Payment
        if 'upi_id' in data:
            restaurant.upi_id = data['upi_id'].strip()
            
        restaurant.updated_at = datetime.utcnow()
        restaurant.save()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': restaurant.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/orders/<order_id>/verify-payment', methods=['POST'])
@restaurant_approved_required
def verify_payment(order_id):
    """Restaurant confirms payment received (for UPI orders)"""
    try:
        user_id = get_jwt_identity()
        restaurant = Restaurant.objects(user=user_id).first()
        order = Order.objects(id=order_id).first()

        if not order or str(order.restaurant.id) != str(restaurant.id):
            return jsonify({'error': 'Order not found'}), 404

        order.payment_status = 'paid'
        order.updated_at = datetime.utcnow()
        order.save()

        return jsonify({'message': 'Payment verified', 'order': order.to_dict()}), 200
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/razorpay/create-order', methods=['POST'])
@restaurant_approved_required
def create_razorpay_order():
    """Create Razorpay order for restaurant to receive payments"""
    try:
        import os
        import razorpay
        client = razorpay.Client(auth=(
            os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_placeholder'),
            os.environ.get('RAZORPAY_KEY_SECRET', 'placeholder')
        ))
        data = request.get_json()
        amount = int(float(data.get('amount', 0)) * 100)  # Convert to paise
        rz_order = client.order.create({'amount': amount, 'currency': 'INR', 'payment_capture': 1})
        return jsonify({'razorpay_order_id': rz_order['id'], 'amount': amount}), 200
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {str(e)}")
        return jsonify({'error': str(e)}), 500
