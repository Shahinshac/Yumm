"""
User Management Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.models.user import User
from backend.app.utils.security import PasswordSecurity
from backend.app.middleware.auth import role_required, get_current_user

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('', methods=['GET'])
@role_required('admin', 'staff')
def list_users():
    """List all users"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    users = User.objects().paginate(page, per_page)

    return jsonify({
        'users': [u.to_dict() for u in users.items],
        'total': users.total,
        'pages': users.pages
    }), 200

@bp.route('/customers', methods=['GET'])
@role_required('admin', 'staff')
def get_customers():
    """Get all customers for dropdown"""
    search = request.args.get('search', '').strip()

    query = User.objects(role='customer')

    if search:
        from mongoengine import Q
        query = query.filter(
            Q(username__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )

    customers = list(query)

    return jsonify({
        'customers': [
            {
                'id': str(c.id),
                'username': c.username,
                'first_name': c.first_name,
                'last_name': c.last_name,
                'email': c.email,
                'phone_number': c.phone_number
            }
            for c in customers
        ],
        'count': len(customers)
    }), 200

@bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get user details"""
    current = get_current_user()
    if current['role'] == 'customer' and current['user_id'] != user_id:
        return jsonify({'error': 'Forbidden'}), 403

    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict()), 200

@bp.route('/<user_id>', methods=['PUT'])
@role_required('admin')
def update_user(user_id):
    """Update user (Admin only)"""
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone_number' in data:
        user.phone_number = data['phone_number']
    if 'role' in data:
        if data['role'] in ['admin', 'staff', 'customer']:
            user.role = data['role']

    user.save()
    return jsonify(user.to_dict()), 200

@bp.route('/<user_id>', methods=['DELETE'])
@role_required('admin')
def delete_user(user_id):
    """Delete user (Admin only)"""
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    current = get_current_user()
    if current['user_id'] == user_id:
        return jsonify({'error': 'Cannot delete yourself'}), 400

    user.delete()
    return jsonify({'message': 'User deleted'}), 200
