"""
Restaurants Routes
"""
from flask import Blueprint, request, jsonify
from backend.app.models.restaurant import Restaurant, MenuItem
from backend.app.middleware.auth import required_auth, get_current_user, role_required

bp = Blueprint('restaurants', __name__, url_prefix='/api/restaurants')

@bp.route('', methods=['GET'])
def list_restaurants():
    """List all restaurants with optional search and filter"""
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()

    query = Restaurant.objects(is_open=True)

    if search:
        from mongoengine import Q
        query = query.filter(Q(name__icontains=search) | Q(category__icontains=search))

    if category:
        query = query.filter(category=category)

    restaurants = list(query)

    return jsonify({
        'count': len(restaurants),
        'restaurants': [r.to_dict() for r in restaurants]
    }), 200

@bp.route('/<restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    """Get restaurant details with menu items"""
    try:
        restaurant = Restaurant.objects(id=restaurant_id).first()
    except Exception:
        restaurant = None

    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    menu_items = MenuItem.objects(restaurant=restaurant)

    return jsonify({
        'restaurant': restaurant.to_dict(),
        'menu_items': [item.to_dict() for item in menu_items],
        'menu_count': len(menu_items)
    }), 200

@bp.route('/<restaurant_id>/menu', methods=['GET'])
def get_restaurant_menu(restaurant_id):
    """Get restaurant menu items grouped by category"""
    try:
        restaurant = Restaurant.objects(id=restaurant_id).first()
    except Exception:
        restaurant = None

    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    menu_items = MenuItem.objects(restaurant=restaurant, is_available=True)

    # Group by category
    categories = {}
    for item in menu_items:
        cat = item.category or 'Other'
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item.to_dict())

    return jsonify({
        'restaurant_id': restaurant_id,
        'restaurant_name': restaurant.name,
        'menu_items': [item.to_dict() for item in menu_items],
        'categories': categories
    }), 200

@bp.route('/<restaurant_id>/menu', methods=['POST'])
@role_required('restaurant', 'admin')
def add_menu_item(restaurant_id):
    """Add a new menu item (restaurant owner or admin)"""
    try:
        restaurant = Restaurant.objects(id=restaurant_id).first()
    except Exception:
        restaurant = None

    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    data = request.get_json()

    if not data.get('name') or data.get('price') is None:
        return jsonify({'error': 'Name and price are required'}), 400

    menu_item = MenuItem(
        restaurant=restaurant,
        name=data['name'],
        description=data.get('description', ''),
        price=float(data['price']),
        category=data.get('category', 'Other'),
        image=data.get('image', ''),
        is_available=data.get('is_available', True),
        is_veg=data.get('is_veg', True),
    )
    menu_item.save()

    return jsonify({
        'message': 'Menu item added',
        'menu_item': menu_item.to_dict()
    }), 201

@bp.route('/<restaurant_id>/menu/<item_id>', methods=['PUT'])
@role_required('restaurant', 'admin')
def update_menu_item(restaurant_id, item_id):
    """Update an existing menu item"""
    try:
        menu_item = MenuItem.objects(id=item_id).first()
    except Exception:
        menu_item = None

    if not menu_item:
        return jsonify({'error': 'Menu item not found'}), 404

    # Verify the item belongs to the requested restaurant
    if str(menu_item.restaurant.id) != restaurant_id:
        return jsonify({'error': 'Menu item does not belong to this restaurant'}), 403

    data = request.get_json()

    if 'name' in data:
        menu_item.name = data['name']
    if 'description' in data:
        menu_item.description = data['description']
    if 'price' in data:
        menu_item.price = float(data['price'])
    if 'category' in data:
        menu_item.category = data['category']
    if 'image' in data:
        menu_item.image = data['image']
    if 'is_available' in data:
        menu_item.is_available = bool(data['is_available'])
    if 'is_veg' in data:
        menu_item.is_veg = bool(data['is_veg'])

    menu_item.save()

    return jsonify({
        'message': 'Menu item updated',
        'menu_item': menu_item.to_dict()
    }), 200

@bp.route('/<restaurant_id>/menu/<item_id>', methods=['DELETE'])
@role_required('restaurant', 'admin')
def delete_menu_item(restaurant_id, item_id):
    """Delete a menu item"""
    try:
        menu_item = MenuItem.objects(id=item_id).first()
    except Exception:
        menu_item = None

    if not menu_item:
        return jsonify({'error': 'Menu item not found'}), 404

    if str(menu_item.restaurant.id) != restaurant_id:
        return jsonify({'error': 'Menu item does not belong to this restaurant'}), 403

    menu_item.delete()

    return jsonify({'message': 'Menu item deleted'}), 200

@bp.route('/<restaurant_id>/orders', methods=['GET'])
@role_required('restaurant', 'admin')
def get_restaurant_orders(restaurant_id):
    """Get all orders for a specific restaurant"""
    from backend.app.models.models import Order
    try:
        restaurant = Restaurant.objects(id=restaurant_id).first()
    except Exception:
        restaurant = None

    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404

    status_filter = request.args.get('status')
    query = Order.objects(restaurant=restaurant)

    if status_filter:
        query = query.filter(status=status_filter)

    orders = list(query.order_by('-created_at'))

    return jsonify({
        'count': len(orders),
        'orders': [o.to_dict() for o in orders]
    }), 200

@bp.route('', methods=['POST'])
@required_auth
def create_restaurant():
    """Create new restaurant (Admin only)"""
    current = get_current_user()
    if not current or current['role'] != 'admin':
        return jsonify({'error': 'Forbidden'}), 403

    data = request.get_json()

    restaurant = Restaurant(
        name=data.get('name'),
        category=data.get('category'),
        address=data.get('address'),
        phone=data.get('phone'),
        location=data.get('location', {'lat': 28.6139, 'lng': 77.2090}),
        image=data.get('image', '🍔'),
        min_order=float(data.get('min_order', 0)),
        delivery_time=int(data.get('delivery_time', 30)),
        delivery_charge=float(data.get('delivery_charge', 50)),
        is_verified=True
    )
    restaurant.save()

    return jsonify({
        'message': 'Restaurant created',
        'restaurant': restaurant.to_dict()
    }), 201

@bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all restaurant categories"""
    restaurants = Restaurant.objects()
    categories = list(set(r.category for r in restaurants if r.category))

    return jsonify({
        'categories': sorted(categories)
    }), 200
