"""
Admin Routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.models.models import Order, Payment
from backend.app.middleware.auth import role_required, get_current_user
from backend.app.utils.security import PasswordSecurity
import logging

logger = logging.getLogger(__name__)

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

    response = jsonify({
        'users': {
            'total': total_users,
            'customers': total_customers,
            'restaurants': total_restaurants,
            'pending': User.objects(is_approved=False, role__in=['restaurant', 'delivery']).count()
        },
        'orders': {
            'total': total_orders,
            'today': today_orders
        },
        'revenue': {
            'week': week_revenue,
            'month': month_revenue
        }
    })
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response, 200

@bp.route('/reset-database', methods=['POST'])
@role_required('admin')
def reset_database():
    """CRITICAL: Wipe entire database except admin. Used for reset between environments."""
    try:
        current_admin = get_current_user()
        
        # Delete all non-admin users
        User.objects(role__ne='admin').delete()
        
        # Delete all operational data
        Restaurant.objects().delete()
        DeliveryPartner.objects().delete()
        Order.objects().delete()
        Payment.objects().delete()
        
        logger.warning(f"Database reset executed by admin: {current_admin.email if current_admin else 'Unknown'}")
        
        return jsonify({
            'success': True,
            'message': 'Database successfully wiped of all production records. Admins remain.'
        }), 200
    except Exception as e:
        logger.error(f"Error resetting database: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

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


# ============ ADMIN APPROVAL WORKFLOWS ============

@bp.route('/pending-users', methods=['GET'])
@role_required('admin')
def get_pending_users():
    """Get list of pending users (restaurants & delivery) waiting for approval"""
    try:
        pending_users = User.objects(
            is_approved=False,
            role__in=['restaurant', 'delivery']
        ).order_by('-created_at')

        result = []
        for user in pending_users:
            user_dict = user.to_dict()

            # Add role-specific data
            if user.role == 'restaurant':
                restaurant = Restaurant.objects(user=user).first()
                if restaurant:
                    user_dict['shop_name'] = restaurant.name
                    user_dict['address'] = restaurant.address

            elif user.role == 'delivery':
                delivery = DeliveryPartner.objects(user=user).first()
                if delivery:
                    user_dict['vehicle_type'] = delivery.vehicle_type

            result.append(user_dict)

        response = jsonify({
            'count': len(result),
            'pending_users': result
        })
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        return response, 200

    except Exception as e:
        logger.error(f"Error fetching pending users: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to fetch pending users', 'details': str(e)}), 500


@bp.route('/approve/<user_id>', methods=['POST'])
@role_required('admin')
def approve_user(user_id):
    """Approve a pending user and generate password

    Response includes the generated password (communicate via email/SMS)
    """
    try:
        user = User.objects(id=user_id).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Only restaurant/delivery users can be approved via this endpoint
        if user.role not in ['restaurant', 'delivery']:
            return jsonify({'error': 'Only restaurants and delivery partners can be approved'}), 403

        # Check if already approved
        if user.is_approved:
            return jsonify({'error': 'User is already approved'}), 400

        # Generate secure password
        generated_password = PasswordSecurity.generate_secure_password()

        # Hash and save password
        user.password_hash = PasswordSecurity.hash_password(generated_password)
        user.is_approved = True
        user.password_generated_at = datetime.utcnow()
        user.save()

        # Update restaurant/delivery record if exists
        if user.role == 'restaurant':
            restaurant = Restaurant.objects(user=user).first()
            if restaurant:
                restaurant.is_approved = True
                restaurant.save()
                logger.info(f"Restaurant approved and password generated: {user.email}")

        elif user.role == 'delivery':
            delivery = DeliveryPartner.objects(user=user).first()
            if delivery:
                # Note: DeliveryPartner doesn't have is_approved field, but we still update
                logger.info(f"Delivery partner approved and password generated: {user.email}")

        logger.info(f"User {user.email} approved by admin, password generated")

        return jsonify({
            'success': True,
            'message': f'User approved successfully',
            'user': user.to_dict(),
            'password': generated_password,
            'note': 'Share this password with the user via email or phone. This is shown only once.'
        }), 200

    except Exception as e:
        logger.error(f"Error approving user: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to approve user', 'details': str(e)}), 500


@bp.route('/reject/<user_id>', methods=['POST'])
@role_required('admin')
def reject_user(user_id):
    """Reject a pending registration (optional - delete user)"""
    try:
        data = request.get_json() or {}
        reason = data.get('reason', 'No reason provided')

        user = User.objects(id=user_id).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.role not in ['restaurant', 'delivery']:
            return jsonify({'error': 'Only pending restaurants and delivery partners can be rejected'}), 403

        if user.is_approved:
            return jsonify({'error': 'Cannot reject an already-approved user'}), 400

        # Delete user and associated data
        if user.role == 'restaurant':
            Restaurant.objects(user=user).delete()
        elif user.role == 'delivery':
            DeliveryPartner.objects(user=user).delete()

        user.delete()

        logger.info(f"User {user.email} rejected by admin. Reason: {reason}")

        return jsonify({
            'success': True,
            'message': f'User registration rejected',
            'email': user.email
        }), 200

    except Exception as e:
        logger.error(f"Error rejecting user: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to reject user', 'details': str(e)}), 500

