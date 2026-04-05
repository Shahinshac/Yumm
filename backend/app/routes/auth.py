"""
Authentication Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from datetime import datetime
from backend.app.models.user import User
from backend.app.utils.security import PasswordSecurity

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.get_json()

    required = ['username', 'email', 'password', 'phone', 'role']
    if not all(data.get(f) for f in required):
        return jsonify({'error': 'Missing required fields'}), 400

    # Validate role
    if data['role'] not in ['customer', 'restaurant', 'delivery', 'admin']:
        return jsonify({'error': 'Invalid role'}), 400

    # Check if user exists
    if User.objects(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.objects(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    # Create user
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=PasswordSecurity.hash_password(data['password']),
        phone=data['phone'],
        role=data['role'],
        full_name=data.get('full_name', ''),
        is_verified=True  # Auto-verify for demo
    )
    user.save()

    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()

    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400

    user = User.objects(username=data['username']).first()

    if not user or not PasswordSecurity.verify_password(data['password'], user.password_hash):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 403

    # Update last login
    user.last_login = datetime.utcnow()
    user.save()

    # Create JWT token
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@bp.route('/me', methods=['GET'])
def get_me():
    """Get current user (requires token)"""
    from flask_jwt_extended import jwt_required, get_jwt_identity

    @jwt_required()
    def _get_me():
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user.to_dict()), 200

    return _get_me()
