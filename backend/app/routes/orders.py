"""
Orders Routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.models import Order, Payment
from backend.app.middleware.auth import required_auth, get_current_user, role_required
from backend.app.routes.socket_events import broadcast_delivery_request, emit_order_status_update, emit_new_order
import logging

logger = logging.getLogger(__name__)

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

    # Calculate total — normalize items to use 'qty' key (handle both 'qty' and 'quantity' from frontend)
    items = data.get('items', [])
    normalized_items = []
    for item in items:
        qty = int(item.get('qty', item.get('quantity', 0)))
        normalized_items.append({
            **item,
            'qty': qty,
            'quantity': qty  # keep both for compatibility
        })
    items = normalized_items
    subtotal = sum(float(item.get('price', 0)) * item['qty'] for item in items)

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

    # Check if first order for 50% discount
    is_first_order = Order.objects(customer=current['user_id']).count() == 0
    first_order_discount = 0
    
    if is_first_order:
        # User requested 50% off for first order
        first_order_discount = subtotal * 0.5
        logger.info(f"Applying 50% first order discount for user {current['user_id']}")

    # Create order
    total_amount = subtotal + restaurant.delivery_charge - promo_discount - first_order_discount
    
    # Ensure total doesn't go below delivery charge (or 0)
    total_amount = max(total_amount, restaurant.delivery_charge)

    order = Order(
        customer=User.objects(id=current['user_id']).first(),
        restaurant=restaurant,
        items=items,
        subtotal=subtotal,
        delivery_charge=restaurant.delivery_charge,
        promo_discount=promo_discount + first_order_discount,
        total_amount=total_amount,
        delivery_address=data.get('delivery_address'),
        special_instructions=data.get('special_instructions', ''),
        status='placed',
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

@bp.route('/<order_id>/status/legacy', methods=['PUT'])
@role_required('restaurant', 'delivery', 'admin')
def update_order_status_legacy(order_id):
    """Update order status (legacy endpoint - use /<order_id>/status PUT instead)"""
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


@bp.route('/auto-assign/<order_id>', methods=['POST'])
@role_required('restaurant')
def auto_assign_delivery(order_id):
    """Auto-assign available delivery partner when restaurant accepts order"""
    try:
        order = Order.objects(id=order_id).first()
    except Exception:
        order = None

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Check order status is "accepted"
    if order.status != 'accepted':
        return jsonify({'error': 'Order must be accepted before assignment'}), 400

    try:
        from backend.app.models.delivery_partner import DeliveryPartner

        # Calculate nearest delivery partner using Haversine algorithm
        import math
        def get_dist(lat1, lon1, lat2, lon2):
            if lat1 is None or lon1 is None or lat2 is None or lon2 is None: return 999999.0
            r = 6371 # Earth radius km
            dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

        restaurant_loc = order.restaurant.location if hasattr(order.restaurant, 'location') and order.restaurant.location else {}
        r_lat = restaurant_loc.get('lat')
        r_lng = restaurant_loc.get('lng')

        # Find available delivery partners
        available_partners = DeliveryPartner.objects(
            is_available=True,
            is_active=True
        )

        delivery_partner = None
        min_dist = float('inf')

        for dp in available_partners:
            dp_loc = dp.current_location or {}
            dp_lat = dp_loc.get('lat')
            dp_lng = dp_loc.get('lng')
            
            # If coordinates are missing, penalize heavily but still allow assignment
            dist = get_dist(r_lat, r_lng, dp_lat, dp_lng)
            if dist < min_dist:
                min_dist = dist
                delivery_partner = dp

        if not delivery_partner:
            # No delivery partner available, mark as waiting
            order.status = 'waiting_for_delivery'
            order.updated_at = datetime.utcnow()
            order.save()
            return jsonify({
                'message': 'No delivery partner available. Order marked as waiting',
                'status': 'waiting_for_delivery',
                'order_id': str(order.id)
            }), 202

        # Assign delivery partner
        order.delivery_partner = delivery_partner.user
        order.status = 'assigned'
        order.updated_at = datetime.utcnow()
        order.save()

        # Mark delivery partner as unavailable
        delivery_partner.is_available = False
        delivery_partner.save()

        return jsonify({
            'message': 'Delivery partner assigned successfully',
            'order': order.to_dict(),
            'delivery_partner': {
                'id': str(delivery_partner.user.id),
                'username': delivery_partner.user.username,
                'phone': delivery_partner.phone,
                'vehicle_type': delivery_partner.vehicle_type
            }
        }), 200

    except Exception as e:
        return jsonify({'error': f'Assignment failed: {str(e)}'}), 500


@bp.route('/<order_id>/status', methods=['PUT'])
@required_auth
def update_order_status(order_id):
    """Update order status (placed → accepted → assigned → picked → delivered)"""
    current = get_current_user()
    data = request.get_json()

    if not data.get('new_status'):
        return jsonify({'error': 'new_status required'}), 400

    try:
        order = Order.objects(id=order_id).first()
    except Exception:
        order = None

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    new_status = data['new_status']
    allowed_statuses = ['placed', 'accepted', 'preparing', 'ready', 'waiting', 'assigned', 'picked', 'delivered', 'cancelled']

    if new_status not in allowed_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(allowed_statuses)}'}), 400

    # Validate status transitions
    current_status = order.status
    status_flow = {
        'placed': ['accepted', 'cancelled'],
        'accepted': ['preparing', 'cancelled'],
        'preparing': ['ready', 'cancelled'],
        'ready': ['waiting', 'assigned', 'cancelled'],
        'waiting': ['assigned', 'cancelled'],
        'assigned': ['picked', 'cancelled'],
        'picked': ['delivered'],
        'delivered': [],
        'cancelled': []
    }

    if new_status not in status_flow.get(current_status, []):
        return jsonify({
            'error': f'Invalid transition from {current_status} to {new_status}',
            'allowed': status_flow.get(current_status, [])
        }), 400

    # Role-based permission checks
    if current.role == 'restaurant' and new_status not in ['accepted', 'preparing', 'ready', 'cancelled']:
        return jsonify({'error': 'Restaurants can only update to accepted, preparing, ready, or cancelled'}), 403

    if current.role == 'delivery' and new_status not in ['picked', 'delivered']:
        return jsonify({'error': 'Delivery partners can only update to picked or delivered'}), 403

    # Update order
    order.status = new_status
    order.updated_at = datetime.utcnow()

    if new_status == 'ready' and order.delivery_partner is None:
        broadcast_delivery_request(order.to_dict())

    # Update delivery partner availability when order is delivered
    if new_status == 'delivered' and order.delivery_partner:
        try:
            from backend.app.models.delivery_partner import DeliveryPartner
            delivery_partner = DeliveryPartner.objects(user=order.delivery_partner).first()
            if delivery_partner:
                delivery_partner.is_available = True
                delivery_partner.total_deliveries += 1
                delivery_partner.save()
        except Exception as e:
            pass  # Log but don't fail

    order.save()

    from backend.app.routes.socket_events import emit_order_status_update
    emit_order_status_update(
        order_id=str(order.id),
        status=new_status,
        order_data=order.to_dict(),
        restaurant_id=str(order.restaurant.id),
        customer_id=str(order.customer.id),
    )

    return jsonify({
        'message': f'Order status updated to {new_status}',
        'order': order.to_dict()
    }), 200


@bp.route('/available-delivery', methods=['GET'])
@role_required('admin')
def get_available_delivery():
    """Get list of available delivery partners"""
    try:
        from backend.app.models.delivery_partner import DeliveryPartner

        delivery_partners = DeliveryPartner.objects(
            is_available=True,
            is_active=True
        )

        return jsonify({
            'total': len(delivery_partners),
            'delivery_partners': [dp.to_dict() for dp in delivery_partners]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
