"""
Socket.IO Event Handlers
Real-time communication for order tracking and live delivery updates
"""
from flask_socketio import emit, join_room, leave_room
from flask_jwt_extended import decode_token
from backend.app import socketio


@socketio.on('connect')
def handle_connect():
    """Client connected"""
    print('🔌 Client connected')
    emit('connected', {'message': 'Connected to FoodHub real-time server'})


@socketio.on('disconnect')
def handle_disconnect():
    """Client disconnected"""
    print('🔌 Client disconnected')


@socketio.on('join_order_room')
def handle_join_order(data):
    """Join a room to receive updates for a specific order.
    Payload: { order_id: str, token: str }
    """
    order_id = data.get('order_id')
    if order_id:
        room = f'order_{order_id}'
        join_room(room)
        emit('joined', {'room': room, 'order_id': order_id})
        print(f'📦 Client joined room: {room}')


@socketio.on('leave_order_room')
def handle_leave_order(data):
    """Leave a specific order room"""
    order_id = data.get('order_id')
    if order_id:
        room = f'order_{order_id}'
        leave_room(room)
        emit('left', {'room': room})


@socketio.on('join_restaurant_room')
def handle_join_restaurant(data):
    """Restaurant panel joins its room to receive new order notifications.
    Payload: { restaurant_id: str }
    """
    restaurant_id = data.get('restaurant_id')
    if restaurant_id:
        room = f'restaurant_{restaurant_id}'
        join_room(room)
        emit('joined', {'room': room, 'restaurant_id': restaurant_id})
        print(f'🍽️  Restaurant joined room: {room}')


@socketio.on('join_delivery_room')
def handle_join_delivery(data):
    """Delivery partner joins room for new delivery assignments.
    Payload: { delivery_partner_id: str }
    """
    partner_id = data.get('delivery_partner_id')
    if partner_id:
        room = f'delivery_{partner_id}'
        join_room(room)
        emit('joined', {'room': room, 'delivery_partner_id': partner_id})
        print(f'🚴 Delivery partner joined room: {room}')


def emit_order_status_update(order_id, status, restaurant_id=None, customer_id=None, extra_data=None):
    """Emit order status update to all relevant rooms.
    Called from the orders route when status changes.
    """
    payload = {
        'order_id': order_id,
        'status': status,
    }
    if extra_data:
        payload.update(extra_data)

    # Notify everyone watching this order
    socketio.emit('order_status_update', payload, room=f'order_{order_id}')

    # Notify the restaurant panel
    if restaurant_id:
        socketio.emit('order_status_update', payload, room=f'restaurant_{restaurant_id}')


def emit_new_order(order_data, restaurant_id):
    """Notify the restaurant of a new incoming order."""
    socketio.emit('new_order', order_data, room=f'restaurant_{restaurant_id}')


def emit_delivery_location_update(order_id, lat, lng, delivery_partner_id=None):
    """Broadcast delivery partner's live location to the order room."""
    payload = {
        'order_id': order_id,
        'lat': lat,
        'lng': lng,
        'timestamp': datetime.utcnow().isoformat() if 'datetime' in globals() else None
    }
    socketio.emit('delivery_location_update', payload, room=f'order_{order_id}')
    # Also broadcast for Admin global map
    socketio.emit('fleet_location_update', {
        'user_id': delivery_partner_id,
        'lat': lat,
        'lng': lng
    }, room='admin_fleet')


@socketio.on('update_location')
def handle_location_update(data):
    """Update delivery partner location in DB and broadcast to rooms.
    Payload: { lat: float, lng: float, order_id: str (optional) }
    """
    from flask_jwt_extended import decode_token
    from backend.app.models.delivery_partner import DeliveryPartner
    from backend.app.models.order import Order
    from datetime import datetime

    token = data.get('token')
    lat = data.get('lat')
    lng = data.get('lng')
    order_id = data.get('order_id')

    if not token or lat is None or lng is None:
        return

    try:
        identity = decode_token(token)['sub']
        partner = DeliveryPartner.objects(user=identity).first()
        
        if partner:
            # Update DB (throttled logic can be here, but usually coordinates are fine)
            partner.current_location = {'lat': lat, 'lng': lng}
            partner.last_online_at = datetime.utcnow()
            partner.save()

            # 1. Broadcast to specific order room if they are on a trip
            if order_id:
                emit_delivery_location_update(order_id, lat, lng, str(identity))
                # Update order object location too
                order = Order.objects(id=order_id).first()
                if order:
                    order.current_location = {'lat': lat, 'lng': lng}
                    order.save()
            
            # 2. Broadcast to Admin Fleet room
            socketio.emit('fleet_location_update', {
                'user_id': str(identity),
                'username': partner.user.username,
                'lat': lat,
                'lng': lng,
                'status': 'online' if partner.is_available else 'busy'
            }, room='admin_fleet')

    except Exception as e:
        print(f"❌ Location update error: {str(e)}")


@socketio.on('join_fleet_room')
def handle_join_fleet(data):
    """Admin joins fleet room for global tracking"""
    join_room('admin_fleet')
    emit('joined', {'room': 'admin_fleet'})
