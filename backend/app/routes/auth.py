"""
Authentication Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime
from backend.app.models.user import User
from backend.app.utils.security import PasswordSecurity
from backend.app.middleware.auth import get_current_user

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    """Login user and return tokens"""
    data = request.get_json()

    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400

    user = User.objects(username=data['username']).first()
    if not user or not PasswordSecurity.verify_password(data['password'], user.password_hash):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 403

    user.last_login = datetime.utcnow()
    user.save()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({'access_token': access_token}), 200

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """Get current user info"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    user = User.objects(id=current_user['user_id']).first()
    return jsonify(user.to_dict()), 200

@bp.route('/register', methods=['POST'])
def register():
    """Register new user (Admin/Staff only via dedicated endpoint)"""
    data = request.get_json()

    required = ['username', 'email', 'password', 'first_name', 'last_name']
    if not all(data.get(f) for f in required):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.objects(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.objects(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=PasswordSecurity.hash_password(data['password']),
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone_number=data.get('phone_number', ''),
        role=data.get('role', 'customer'),
        is_active=True
    )
    user.save()

    return jsonify({'user': user.to_dict()}), 201
