"""
Orders Routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.models import Order, Payment
from backend.app.middleware.auth import required_auth, get_current_user, role_required
from backend.app.routes.socket_events import emit_order_status_update, emit_new_order

bp = Blueprint('orders', __name__, url_prefix='/api/orders')

@bp.route('', methods=['POST'])
@role_required('customer')
def create_order():
    """Create new order"""
    current = get_current_user()
    data = request.get_json()

    # Validate
    if not data.get('restaurant_id') or not data.get('items'):
        return jsonify({'error': 'Restaurant ID and items required'}), 400

    try:
        restaurant = Restaurant.objects(id=data['restaurant_id']).first()
    except Exception:
        restaurant = None

    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    # Calculate total
    items = data.get('items', [])
    subtotal = sum(float(item.get('price', 0)) * int(item.get('qty', 0)) for item in items)

    if subtotal < restaurant.min_order:
        return jsonify({'error': f'Minimum order is ₹{restaurant.min_order}'}), 400

    # Apply promo code if provided
    promo_discount = 0
    promo_code = data.get('promo_code')
    if promo_code:
        from backend.app.models.models import PromoCode
        promo = PromoCode.objects(code=promo_code, is_active=True).first()
        if promo and promo.valid_till > datetime.utcnow():
            if promo.discount_type == 'percentage':
                promo_discount = (subtotal * promo.discount_value) / 100
                if promo.max_discount:
                    promo_discount = min(promo_discount, promo.max_discount)
            else:
                promo_discount = promo.discount_value

    # Create order
    total_amount = subtotal + restaurant.delivery_charge - promo_discount

    order = Order(
        customer=User.objects(id=current['user_id']).first(),
        restaurant=restaurant,
        items=items,
        subtotal=subtotal,
        delivery_charge=restaurant.delivery_charge,
        promo_discount=promo_discount,
        total_amount=total_amount,
        delivery_address=data.get('delivery_address'),
        special_instructions=data.get('special_instructions', ''),
        status='pending',
        estimated_delivery=datetime.utcnow() + timedelta(minutes=restaurant.delivery_time)
    )
    order.save()

    # Create payment record
    payment = Payment(
        order=order,
        amount=total_amount,
        method=data.get('payment_method', 'card'),
        status='completed'  # Auto-complete for demo
    )
    payment.save()

    # Notify the restaurant panel about the new order via SocketIO
    emit_new_order(order.to_dict(), str(restaurant.id))

    return jsonify({
        'message': 'Order placed successfully',
        'order': order.to_dict()
    }), 201

@bp.route('', methods=['GET'])
@required_auth
def list_orders():
    """List orders for current user"""
    current = get_current_user()
    status_filter = request.args.get('status')

    if current['role'] == 'customer':
        query = Order.objects(customer=current['user_id'])
    elif current['role'] == 'restaurant':
        query = Order.objects(restaurant=current['user_id'])
    elif current['role'] == 'delivery':
        query = Order.objects(delivery_partner=current['user_id'])
    else:
        query = Order.objects()

    if status_filter:
        query = query.filter(status=status_filter)

    orders = list(query.order_by('-created_at'))

    return jsonify({
        'count': len(orders),
        'orders': [o.to_dict() for o in orders]
    }), 200

@bp.route('/<order_id>', methods=['GET'])
@required_auth
def get_order(order_id):
    """Get order details"""
    try:
        order = Order.objects(id=order_id).first()
    except Exception:
        order = None

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    current = get_current_user()
    # Check authorization
    if current['role'] == 'customer' and str(order.customer.id) != current['user_id']:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify(order.to_dict()), 200

@bp.route('/<order_id>/status', methods=['PUT'])
@role_required('restaurant', 'delivery', 'admin')
def update_order_status(order_id):
    """Update order status"""
    try:
        order = Order.objects(id=order_id).first()
    except Exception:
        order = None

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    data = request.get_json()
    new_status = data.get('status')

    valid_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400

    order.status = new_status
    order.updated_at = datetime.utcnow()

    if new_status == 'delivered':
        order.delivered_at = datetime.utcnow()

    order.save()

    # Emit real-time status update to all watchers
    emit_order_status_update(
        order_id=str(order.id),
        status=new_status,
        restaurant_id=str(order.restaurant.id),
        customer_id=str(order.customer.id),
    )

    return jsonify({
        'message': f'Order status updated to {new_status}',
        'order': order.to_dict()
    }), 200

@bp.route('/<order_id>/track', methods=['GET'])
@required_auth
def track_order(order_id):
    """Real-time order tracking"""
    try:
        order = Order.objects(id=order_id).first()
    except Exception:
        order = None

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    return jsonify({
        'order_id': order_id,
        'status': order.status,
        'current_location': order.current_location,
        'estimated_delivery': order.estimated_delivery.isoformat() if order.estimated_delivery else None,
        'restaurant': {
            'name': order.restaurant.name,
            'location': order.restaurant.location
        },
        'delivery_address': order.delivery_address
    }), 200
