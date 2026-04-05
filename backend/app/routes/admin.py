"""
Admin Routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.models import Order, Payment
from backend.app.middleware.auth import role_required, get_current_user

bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@bp.route('/dashboard', methods=['GET'])
@role_required('admin')
def get_dashboard():
    """Get admin dashboard stats"""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # Stats
    total_users = User.objects().count()
    total_customers = User.objects(role='customer').count()
    total_restaurants = Restaurant.objects().count()
    total_orders = Order.objects().count()

    # Revenue
    week_revenue = sum(
        o.total_amount for o in Order.objects(
            status='delivered',
            delivered_at__gte=week_ago
        )
    ) or 0

    month_revenue = sum(
        o.total_amount for o in Order.objects(
            status='delivered',
            delivered_at__gte=month_ago
        )
    ) or 0

    # Orders today
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = Order.objects(created_at__gte=today).count()

    return jsonify({
        'users': {
            'total': total_users,
            'customers': total_customers,
            'restaurants': total_restaurants
        },
        'orders': {
            'total': total_orders,
            'today': today_orders
        },
        'revenue': {
            'week': week_revenue,
            'month': month_revenue
        }
    }), 200

@bp.route('/users', methods=['GET'])
@role_required('admin')
def list_users():
    """List all users"""
    role_filter = request.args.get('role')

    query = User.objects()

    if role_filter:
        query = query.filter(role=role_filter)

    users = list(query)

    return jsonify({
        'count': len(users),
        'users': [u.to_dict() for u in users]
    }), 200

@bp.route('/restaurants', methods=['GET'])
@role_required('admin')
def list_restaurants():
    """List all restaurants"""
    restaurants = Restaurant.objects()

    return jsonify({
        'count': len(restaurants),
        'restaurants': [r.to_dict() for r in restaurants]
    }), 200

@bp.route('/orders', methods=['GET'])
@role_required('admin')
def list_all_orders():
    """List all orders"""
    status_filter = request.args.get('status')

    query = Order.objects()

    if status_filter:
        query = query.filter(status=status_filter)

    orders = list(query.order_by('-created_at'))

    return jsonify({
        'count': len(orders),
        'orders': [o.to_dict() for o in orders]
    }), 200

@bp.route('/analytics/orders', methods=['GET'])
@role_required('admin')
def order_analytics():
    """Get order analytics"""
    period = request.args.get('period', 'week')  # week, month, year

    if period == 'week':
        start_date = datetime.utcnow() - timedelta(days=7)
    elif period == 'month':
        start_date = datetime.utcnow() - timedelta(days=30)
    else:
        start_date = datetime.utcnow() - timedelta(days=365)

    orders = Order.objects(created_at__gte=start_date)

    # Group by status
    status_breakdown = {}
    for order in orders:
        status = order.status
        if status not in status_breakdown:
            status_breakdown[status] = 0
        status_breakdown[status] += 1

    # Total metrics
    total_orders = len(orders)
    total_revenue = sum(o.total_amount for o in orders if o.status == 'delivered') or 0
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

    return jsonify({
        'period': period,
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'avg_order_value': round(avg_order_value, 2),
        'status_breakdown': status_breakdown
    }), 200

@bp.route('/analytics/restaurants', methods=['GET'])
@role_required('admin')
def restaurant_analytics():
    """Get restaurant analytics"""
    restaurants = Restaurant.objects()

    top_restaurants = sorted(
        [
            {
                'name': r.name,
                'rating': r.rating,
                'reviews': r.total_reviews,
                'orders': Order.objects(restaurant=r, status='delivered').count()
            }
            for r in restaurants
        ],
        key=lambda x: x['rating'],
        reverse=True
    )[:10]

    return jsonify({
        'total_restaurants': len(restaurants),
        'top_restaurants': top_restaurants
    }), 200
