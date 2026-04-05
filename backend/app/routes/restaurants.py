"""
Restaurants Routes
"""
from flask import Blueprint, request, jsonify
from backend.app.models.restaurant import Restaurant, MenuItem
from backend.app.middleware.auth import required_auth, get_current_user

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
        'categories': categories
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
