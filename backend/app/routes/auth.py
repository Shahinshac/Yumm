"""
Authentication Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.utils.security import PasswordSecurity
from backend.app.utils.validators import Validators
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """Register new user (legacy - maintains backward compatibility)"""
    data = request.get_json()

    required = ['username', 'email', 'password', 'phone', 'role']
    if not all(data.get(f) for f in required):
        return jsonify({'error': 'Missing required fields'}), 400

    # Validate role
    if not Validators.validate_role(data['role']):
        return jsonify({'error': 'Invalid role. Must be customer, restaurant, delivery, or admin'}), 400

    # Validate inputs
    if not Validators.validate_username(data['username']):
        return jsonify({'error': 'Invalid username. Use alphanumeric, underscore, hyphen (3-20 chars)'}), 400

    if not Validators.validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400

    if not Validators.validate_phone(data['phone']):
        return jsonify({'error': 'Invalid phone number'}), 400

    is_valid_password, password_error = Validators.validate_password(data['password'])
    if not is_valid_password:
        return jsonify({'error': password_error}), 400

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
        is_verified=True,  # Auto-verify for demo
        is_active=True,
        is_approved=True  # Auto-approve for legacy flow
    )
    user.save()

    # Return access token so the client can log in immediately
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Registration successful. Complete your role-specific setup.',
        'access_token': access_token,
        'user': user.to_dict(),
        'next_step': {
            'customer': '/api/customer/restaurants',
            'restaurant': '/api/restaurant/register',
            'delivery': '/api/delivery/register',
            'admin': '/api/admin/stats'
        }.get(data['role'])
    }), 201


@bp.route('/register/restaurant', methods=['POST'])
def register_restaurant():
    """Register restaurant for approval workflow"""
    from backend.app.models.restaurant import Restaurant

    data = request.get_json()
    logger.info(f"Restaurant registration attempt: {data.get('email', 'unknown')}")

    # Validate required fields
    required_fields = ['name', 'email', 'phone', 'shop_name', 'address']
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400

    # Validate inputs
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    shop_name = data.get('shop_name', '').strip()
    address = data.get('address', '').strip()
    category = data.get('category', 'Restaurant').strip() or 'Restaurant'

    if not Validators.validate_name(name):
        return jsonify({'error': 'Invalid name. Must be 2-100 characters'}), 400

    if not Validators.validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    if not Validators.validate_phone(phone):
        return jsonify({'error': 'Invalid phone number. Must be 10-15 digits'}), 400

    if not Validators.validate_shop_name(shop_name):
        return jsonify({'error': 'Invalid shop name. Must be 2-200 characters'}), 400

    if not Validators.validate_address(address):
        return jsonify({'error': 'Invalid address. Must be 5-500 characters'}), 400

    # Check if email already exists
    if User.objects(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    try:
        # Create user with restaurant role (not approved)
        user = User(
            username=email.split('@')[0] + '_rest',  # Generate username from email
            email=email,
            phone=phone,
            full_name=name,
            role='restaurant',
            is_approved=False,
            is_verified=False,
            is_active=True,
            password_hash=None  # No password until admin approves
        )
        user.save()

        # Create restaurant record
        restaurant = Restaurant(
            user=user,
            name=shop_name,
            address=address,
            category=category,
            is_approved=False,
            is_verified=False
        )
        restaurant.save()

        logger.info(f"Restaurant registration submitted: {email}")
        return jsonify({
            'message': 'Registration successful. Awaiting admin approval.',
            'user_id': str(user.id),
            'next_step': 'Contact admin at shaahnpvt7@gmail.com to check approval status'
        }), 201

    except Exception as e:
        logger.error(f"Restaurant registration error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500


@bp.route('/register/delivery', methods=['POST'])
def register_delivery():
    """Register delivery partner for approval workflow"""

    data = request.get_json()

    # Validate required fields
    required_fields = ['name', 'email', 'phone', 'vehicle_type']
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400

    # Validate inputs
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    vehicle_type = data.get('vehicle_type', '').strip().lower()

    if not Validators.validate_name(name):
        return jsonify({'error': 'Invalid name. Must be 2-100 characters'}), 400

    if not Validators.validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    if not Validators.validate_phone(phone):
        return jsonify({'error': 'Invalid phone number. Must be 10-15 digits'}), 400

    if not Validators.validate_vehicle_type(vehicle_type):
        return jsonify({'error': 'Invalid vehicle type. Must be: bike, scooter, car, or bicycle'}), 400

    # Check if email already exists
    if User.objects(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    try:
        # Create user with delivery role (not approved)
        user = User(
            username=email.split('@')[0] + '_delivery',  # Generate username from email
            email=email,
            phone=phone,
            full_name=name,
            role='delivery',
            is_approved=False,
            is_verified=False,
            is_active=True,
            password_hash=None  # No password until admin approves
        )
        user.save()

        # Create delivery partner record
        delivery_partner = DeliveryPartner(
            user=user,
            phone=phone,
            vehicle_type=vehicle_type,
            is_verified=False,
            is_active=True
        )
        delivery_partner.save()

        logger.info(f"Delivery registration submitted: {email}")
        return jsonify({
            'message': 'Registration successful. Awaiting admin approval.',
            'user_id': str(user.id),
            'next_step': 'Contact admin at shaahnpvt7@gmail.com to check approval status'
        }), 201

    except Exception as e:
        logger.error(f"Delivery registration error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500


@bp.route('/google-login', methods=['POST'])
def google_login():
    """Google Sign-In for customers using Access Token

    Accepts the access_token from Google OAuth2 (via google_sign_in Flutter plugin),
    verifies it directly against Google's userinfo endpoint, then logs the user in.
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_auth_req
    import os

    data = request.get_json()

    access_token = data.get('access_token', '').strip()
    if not access_token:
        return jsonify({'error': 'Missing access_token'}), 400

    try:
        # Mock logic for local testing without actual Google Auth flow
        if access_token == 'mock_test_user':
            logger.info("Using mock google verification for local testing")
            google_id = "mock_google_12345"
            email = "testcustomer@example.com"
            name = "Test Customer"
        else:
            # For web, Google Identity Services (GIS) provides an ID Token (JWT)
            # which must be verified against the GOOGLE_CLIENT_ID
            client_id = os.getenv('GOOGLE_CLIENT_ID')
            if not client_id:
                logger.error("GOOGLE_CLIENT_ID not found in environment")
                return jsonify({'error': 'Server configuration error: missing client ID'}), 500

            try:
                # Verify the ID Token
                # 'access_token' variable in this context contains the ID Token string
                id_info = id_token.verify_oauth2_token(
                    access_token,
                    google_auth_req.Request(),
                    client_id
                )

                google_id = id_info.get('sub')
                email = id_info.get('email')
                name = id_info.get('name', email)

                if not email or not google_id:
                    return jsonify({'error': 'Unable to retrieve required user info from Google'}), 400

                logger.info(f"Google ID token verified for: {email}")

            except ValueError as ve:
                logger.warning(f"Google ID token verification failed: {str(ve)}")
                return jsonify({'error': 'Invalid or expired Google token', 'details': str(ve)}), 401

        # Check if user exists by google_id or email
        existing_user = User.objects(google_id=google_id).first()
        if not existing_user:
            existing_user = User.objects(email=email).first()

        if existing_user:
            if existing_user.role != 'customer':
                return jsonify({'error': 'Email already registered as a different role'}), 403
            user = existing_user
        else:
            # Create new customer user
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1

            user = User(
                username=username,
                email=email,
                phone='0000000000',
                full_name=name,
                role='customer',
                is_approved=True,
                is_verified=True,
                is_active=True,
                google_id=google_id,
                password_hash=None
            )
            user.save()
            logger.info(f"New customer created via Google: {email}")

        # Update last login
        user.last_login = datetime.utcnow()
        user.save()

        access_token_jwt = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'Google login successful',
            'access_token': access_token_jwt,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Google login error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500


@bp.route('/login', methods=['POST'])
def login():
    """Login user with email and password

    Note: Customers cannot login here (they use Google login)
    Restaurants/Delivery must be approved before login allowed
    """
    try:
        data = request.get_json()

        # Accept both email and username for backward compatibility
        identifier = data.get('email') or data.get('username')
        password = data.get('password')

        if not identifier or not password:
            return jsonify({'error': 'Email/username and password required'}), 400

        # Try to find user by email first, then username
        user = User.objects(email=identifier).first()
        if not user:
            user = User.objects(username=identifier).first()

        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        # Check if no password hash (Google user or unapproved)
        if not user.password_hash:
            if user.role == 'customer':
                return jsonify({'error': 'Customers must use Google login'}), 403
            else:
                return jsonify({
                    'error': 'You can login only after admin approval. Please contact admin: shaahnpvt7@gmail.com'
                }), 403

        # Verify password
        if not PasswordSecurity.verify_password(password, user.password_hash):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Check if active
        if not user.is_active:
            return jsonify({'error': 'Account is disabled'}), 403

        # Check approval status for restaurants/delivery
        if user.role in ['restaurant', 'delivery']:
            if not user.is_approved:
                return jsonify({
                    'error': 'You can login only after admin approval. Please contact admin: shaahnpvt7@gmail.com'
                }), 403

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
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500


@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        
        # Update fields if provided
        if 'full_name' in data:
            user.full_name = Validators.sanitize_string(data['full_name'])
        if 'phone' in data:
            if not Validators.validate_phone(data['phone']):
                return jsonify({'error': 'Invalid phone number format'}), 400
            user.phone = data['phone']
        if 'address' in data:
            user.address = Validators.sanitize_string(data['address'])
            
        user.save()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """Get current user (requires token)"""
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

