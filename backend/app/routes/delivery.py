"""
Delivery Partner Routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.app.models.user import User
from backend.app.models.models import Order, DeliveryAssignment
from backend.app.middleware.auth import required_auth, get_current_user, role_required
from backend.app.routes.socket_events import emit_delivery_location_update, emit_order_status_update

bp = Blueprint('delivery', __name__, url_prefix='/api/delivery')

@bp.route('/available-orders', methods=['GET'])
@role_required('delivery')
def get_available_orders():
    """Get available orders for delivery"""
    # Get orders that are ready and not assigned
    orders = Order.objects(status='ready', delivery_partner__exists=False)

    return jsonify({
        'count': len(orders),
        'orders': [
            {
                'id': str(o.id),
                'restaurant': o.restaurant.name,
                'delivery_address': o.delivery_address,
                'total_amount': o.total_amount,
                'created_at': o.created_at.isoformat()
            }
            for o in orders
        ]
    }), 200

@bp.route('/accept-order/<order_id>', methods=['POST'])
@role_required('delivery')
def accept_order(order_id):
    """Accept delivery order"""
    current = get_current_user()

    try:
        order = Order.objects(id=order_id).first()
    except Exception:
        order = None

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if order.delivery_partner:
        return jsonify({'error': 'Order already assigned'}), 400

    # Assign delivery partner
    order.delivery_partner = User.objects(id=current['user_id']).first()
    order.status = 'on_the_way'
    order.save()

    # Create delivery assignment
    assignment = DeliveryAssignment(
        order=order,
        delivery_partner=User.objects(id=current['user_id']).first(),
        status='accepted',
        accepted_at=datetime.utcnow()
    )
    assignment.save()

    return jsonify({
        'message': 'Order accepted',
        'order': order.to_dict()
    }), 200

@bp.route('/my-orders', methods=['GET'])
@role_required('delivery')
def get_my_orders():
    """Get orders assigned to delivery partner"""
    current = get_current_user()
    status_filter = request.args.get('status')

    query = Order.objects(delivery_partner=current['user_id'])

    if status_filter:
        query = query.filter(status=status_filter)

    orders = list(query.order_by('-updated_at'))

    return jsonify({
        'count': len(orders),
        'orders': [o.to_dict() for o in orders]
    }), 200

@bp.route('/<order_id>/update-location', methods=['PUT'])
@role_required('delivery')
def update_delivery_location(order_id):
    """Update delivery partner location"""
    current = get_current_user()
    data = request.get_json()

    try:
        order = Order.objects(id=order_id).first()
    except Exception:
        order = None

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if str(order.delivery_partner.id) != current['user_id']:
        return jsonify({'error': 'Forbidden'}), 403

    lat = data.get('lat')
    lng = data.get('lng')

    if lat is None or lng is None:
        return jsonify({'error': 'lat and lng coordinates are required'}), 400

    try:
        lat = float(lat)
        lng = float(lng)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid coordinates: lat and lng must be numbers'}), 400

    # Update location
    order.current_location = {'lat': lat, 'lng': lng}
    order.save()

    # Broadcast live location to all order watchers via SocketIO
    emit_delivery_location_update(
        order_id=str(order.id),
        lat=lat,
        lng=lng,
    )

    return jsonify({
        'message': 'Location updated',
        'location': order.current_location
    }), 200

@bp.route('/<order_id>/mark-delivered', methods=['PUT'])
@role_required('delivery')
def mark_delivered(order_id):
    """Mark order as delivered"""
    current = get_current_user()

    try:
        order = Order.objects(id=order_id).first()
    except Exception:
        order = None

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if str(order.delivery_partner.id) != current['user_id']:
        return jsonify({'error': 'Forbidden'}), 403

    order.status = 'delivered'
    order.delivered_at = datetime.utcnow()
    order.save()

    # Notify order watchers of delivery completion
    emit_order_status_update(
        order_id=str(order.id),
        status='delivered',
        restaurant_id=str(order.restaurant.id),
        customer_id=str(order.customer.id),
    )

    return jsonify({
        'message': 'Order marked as delivered',
        'order': order.to_dict()
    }), 200

@bp.route('/stats', methods=['GET'])
@role_required('delivery')
def get_delivery_stats():
    """Get delivery partner stats"""
    current = get_current_user()

    delivered = Order.objects(delivery_partner=current['user_id'], status='delivered').count()
    active = Order.objects(delivery_partner=current['user_id'], status__in=['on_the_way', 'ready']).count()
    total_earnings = Order.objects(delivery_partner=current['user_id'], status='delivered').sum('total_amount') or 0

    return jsonify({
        'delivered_orders': delivered,
        'active_orders': active,
        'total_earnings': total_earnings
    }), 200

@bp.route('/update-location', methods=['PUT'])
@role_required('delivery')
def update_my_location():
    """Update delivery partner's current location (bulk update across active orders).
    Payload: { lat: float, lng: float }
    """
    current = get_current_user()
    data = request.get_json()

    raw_lat = data.get('lat', data.get('latitude'))
    raw_lng = data.get('lng', data.get('longitude'))

    if raw_lat is None or raw_lng is None:
        return jsonify({'error': 'lat and lng coordinates are required'}), 400

    try:
        lat = float(raw_lat)
        lng = float(raw_lng)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid coordinates: lat and lng must be numbers'}), 400

    # Update location on all active orders assigned to this partner
    active_orders = Order.objects(
        delivery_partner=current['user_id'],
        status__in=['on_the_way']
    )

    for order in active_orders:
        order.current_location = {'lat': lat, 'lng': lng}
        order.save()
        emit_delivery_location_update(str(order.id), lat, lng)

    return jsonify({'message': 'Location updated', 'lat': lat, 'lng': lng}), 200
