"""
Reviews Routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.models import Order, Review
from backend.app.middleware.auth import required_auth, role_required, get_current_user

bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@bp.route('', methods=['POST'])
@role_required('customer')
def create_review():
    """Create review for order"""
    current = get_current_user()
    data = request.get_json()

    try:
        order = Order.objects(id=data.get('order_id')).first()
    except:
        order = None

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if str(order.customer.id) != current['user_id']:
        return jsonify({'error': 'Forbidden'}), 403

    # Check if already reviewed
    if Review.objects(order=order).first():
        return jsonify({'error': 'Review already exists'}), 400

    review = Review(
        order=order,
        customer=User.objects(id=current['user_id']).first(),
        restaurant=order.restaurant,
        rating=int(data.get('rating', 5)),
        review_text=data.get('review_text', ''),
        food_quality=int(data.get('food_quality', 5)),
        delivery_speed=int(data.get('delivery_speed', 5)),
        packaging=int(data.get('packaging', 5))
    )
    review.save()

    # Update restaurant rating
    reviews = Review.objects(restaurant=order.restaurant)
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    order.restaurant.rating = round(avg_rating, 1)
    order.restaurant.total_reviews = len(reviews)
    order.restaurant.save()

    return jsonify({
        'message': 'Review created',
        'review': review.to_dict()
    }), 201

@bp.route('/restaurant/<restaurant_id>', methods=['GET'])
def get_restaurant_reviews(restaurant_id):
    """Get reviews for restaurant"""
    reviews = Review.objects(restaurant=restaurant_id).order_by('-created_at')

    return jsonify({
        'count': len(reviews),
        'reviews': [r.to_dict() for r in reviews]
    }), 200
