"""
Flask Application Factory
Food Delivery App - Complete System with Professional Setup
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from mongoengine import connect, ConnectionFailure
import os
import logging
from datetime import timedelta

jwt = JWTManager()
# socketio instance shared across the app
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')


def setup_logging(app):
    """Configure logging for the application"""
    log_dir = app.config.get('LOG_DIR', 'logs')
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO'))

    # Create logs directory if it doesn't exist
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(log_level)

    # File handler
    fh = logging.FileHandler(os.path.join(log_dir, 'app.log'))
    fh.setLevel(log_level)

    # Console handler
    ch = logging.StreamHandler()
    ch.setLevel(log_level)

    # Formatter
    formatter = logging.Formatter(app.config.get('LOG_FORMAT'))
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)

    logger.addHandler(fh)
    logger.addHandler(ch)

    return logger


def create_app():
    """Application factory"""
    app = Flask(__name__)

    # Load configuration based on environment
    env = os.getenv('FLASK_ENV', 'production')
    from backend.config import config
    app.config.from_object(config.get(env, config['default']))

    # Setup logging
    logger = setup_logging(app)
    logger.info(f"Starting FoodHub App in {env} mode")

    # Configuration
    app.config['JSON_SORT_KEYS'] = False
    app.config['PROPAGATE_EXCEPTIONS'] = app.config.get('PROPAGATE_EXCEPTIONS', True)

    # MongoDB Connection with error handling
    try:
        db_uri = app.config['MONGODB_SETTINGS'].get('host', 'mongodb://localhost:27017/fooddelivery')
        logger.info(f"Connecting to MongoDB: {db_uri[:50]}..." if len(db_uri) > 50 else f"Connecting to MongoDB: {db_uri}")

        # MongoDB Atlas (mongodb+srv://) automatically handles SSL/TLS
        # No additional SSL parameters needed - let PyMongo/MongoEngine handle it
        if 'mongodb+srv://' in db_uri:
            logger.info("Detected mongodb+srv:// connection - SSL/TLS automatically enabled by MongoDB Atlas")

        # Connection parameters
        conn_kwargs = {
            'serverSelectionTimeoutMS': app.config['MONGODB_SETTINGS'].get('serverSelectionTimeoutMS', 5000),
            'connectTimeoutMS': app.config['MONGODB_SETTINGS'].get('connectTimeoutMS', 10000),
        }

        connect(host=db_uri, **conn_kwargs)
        logger.info("✅ MongoDB connected successfully")

    except ConnectionFailure as e:
        error_str = str(e)
        logger.error(f"❌ MongoDB connection failed: {error_str}")

        # Diagnostics
        if 'IP whitelist' in error_str or 'Unauthorized' in error_str or '47' in error_str:
            logger.error("⚠️  IP Whitelist Error - Render cannot access MongoDB Atlas:")
            logger.error("   1. Go to: https://cloud.mongodb.com/ → foodhub project")
            logger.error("   2. Network Access → IP Whitelist")
            logger.error("   3. Add IP address: 0.0.0.0/0 (for testing)")
            logger.error("   4. Wait 1-2 minutes for changes to apply")
        elif 'authentication' in error_str.lower() or 'auth' in error_str.lower():
            logger.error("⚠️  Authentication Error:")
            logger.error("   Check MongoDB Atlas credentials in Render environment variables")
            logger.error("   Verify MONGODB_URI is set correctly")
        elif 'Timeout' in error_str or 'timeout' in error_str:
            logger.error("⚠️  Connection Timeout:")
            logger.error("   MongoDB Atlas may be unreachable or slow to respond")
            logger.error("   Check: IP whitelist, network connectivity, cluster status")

        raise RuntimeError(f"Could not connect to MongoDB: {error_str}")

    except Exception as e:
        error_str = str(e)
        logger.error(f"❌ Unexpected error during MongoDB connection: {error_str}")
        logger.error(f"Error type: {type(e).__name__}")

        if "Unknown option" in error_str:
            logger.error("💡 Invalid connection parameter detected")
            logger.error("   This typically means an unsupported option was passed to MongoEngine.connect()")
            logger.error("   Verify connection parameters are compatible with MongoEngine version")
        elif 'IP' in error_str or 'whitelist' in error_str.lower():
            logger.error("💡 Possible IP whitelist issue - Add 0.0.0.0/0 to MongoDB Atlas Network Access")
        elif 'auth' in error_str.lower():
            logger.error("💡 Possible authentication issue - Check MongoDB username and password in Render environment")

        raise

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['JWT_SECRET_KEY'])

    # CORS
    cors_origins = [origin.strip() for origin in app.config.get('CORS_ORIGINS', '*').split(',')]
    CORS(app, resources={r"/api/*": {"origins": cors_origins, "supports_credentials": True}})
    logger.info(f"✅ CORS configured for origins: {cors_origins}")

    # JWT Initialization
    jwt.init_app(app)

    # JWT Error Handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({'error': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization token is missing'}), 401

    # Initialize SocketIO with the app
    socketio.init_app(app, cors_allowed_origins="*")
    logger.info("✅ SocketIO configured")

    # Register blueprints
    logger.info("Registering API blueprints...")

    # Version endpoint
    @app.route('/api/version', methods=['GET'])
    def version_check():
        return jsonify({
            'version': '2.0.0',
            'build': 'auth-approval-system-v2',
            'features': ['google-signin', 'restaurant-registration', 'admin-approval', 'role-based-access'],
            'status': 'production'
        }), 200

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        try:
            # Try a simple database access to check connection
            from backend.app.models.user import User
            user_count = User.objects.count()
            return jsonify({
                'status': 'healthy',
                'message': 'FoodHub Backend is running',
                'database': 'connected',
                'users': user_count
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'message': 'FoodHub Backend is running but database is not accessible',
                'error': str(e)
            }), 503

    try:
        from backend.app.routes import (
            auth, 
            restaurants, 
            orders, 
            delivery, 
            admin, 
            reviews, 
            promo,
            customer,
            restaurant_dashboard,
            delivery_dashboard,
            admin_dashboard
        )

        app.register_blueprint(auth.bp)
        app.register_blueprint(customer.bp)
        app.register_blueprint(restaurant_dashboard.bp)
        app.register_blueprint(delivery_dashboard.bp)
        app.register_blueprint(admin_dashboard.bp)
        app.register_blueprint(restaurants.bp)
        app.register_blueprint(orders.bp)
        app.register_blueprint(delivery.bp)
        app.register_blueprint(admin.bp)
        app.register_blueprint(reviews.bp)
        app.register_blueprint(promo.bp)

        logger.info("✅ All blueprints registered successfully")
    except Exception as e:
        logger.error(f"Failed to register blueprints: {str(e)}")
        raise

    # Register SocketIO event handlers
    try:
        from backend.app.routes import socket_events  # noqa: F401
        logger.info("✅ SocketIO events registered")
    except Exception as e:
        logger.error(f"Failed to register socket events: {str(e)}")
        raise

    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found', 'status': 404}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'error': 'Method not allowed', 'status': 405}), 405

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'status': 500,
            'details': str(error)
        }), 500

    # Seed demo data only when explicitly enabled in non-production environments.
    enable_demo_data = os.getenv('ENABLE_DEMO_DATA', 'false').lower() == 'true'
    if env in ['development', 'testing'] and enable_demo_data:
        try:
            logger.info("Creating demo data...")
            create_demo_data(app, logger)
        except Exception as e:
            logger.error(f"Failed to create demo data: {str(e)}")
            # Don't fail startup if demo data creation fails

    logger.info("✅ FoodHub App initialized successfully!")

    return app


def create_demo_data(app, logger):
    """Create demo restaurants and items"""
    from backend.app.models.restaurant import Restaurant, MenuItem
    from backend.app.models.user import User
    from backend.app.utils.security import PasswordSecurity

    # Create demo restaurants if not exist
    if Restaurant.objects.count() == 0:
        restaurants_data = [
            {
                'name': 'Paragon',
                'category': 'Biryani & Kerala',
                'location': {'lat': 11.0089, 'lng': 76.0305},
                'address': 'Malappuram, Kerala',
                'rating': 4.7,
                'image': '🍛',
                'delivery_time': 30,
                'min_order': 200
            },
            {
                'name': 'Devi Prasad',
                'category': 'Traditional Kerala',
                'location': {'lat': 11.0089, 'lng': 76.0305},
                'address': 'Malappuram, Kerala',
                'rating': 4.5,
                'image': '🥘',
                'delivery_time': 35,
                'min_order': 150
            },
            {
                'name': 'Hot Spot',
                'category': 'Multi-cuisine',
                'location': {'lat': 11.0089, 'lng': 76.0305},
                'address': 'Malappuram, Kerala',
                'rating': 4.4,
                'image': '🍴',
                'delivery_time': 25,
                'min_order': 250
            },
            {
                'name': 'Sree Bhagavathy Palace',
                'category': 'Seafood & Kerala',
                'location': {'lat': 11.0089, 'lng': 76.0305},
                'address': 'Malappuram, Kerala',
                'rating': 4.6,
                'image': '🦐',
                'delivery_time': 40,
                'min_order': 300
            }
        ]

        for rest_data in restaurants_data:
            restaurant = Restaurant(**rest_data)
            restaurant.save()

            # Add specific menu items based on restaurant
            menus = {
                'Paragon': [
                    {'name': 'Chicken Biryani', 'price': 280, 'description': 'Fragrant basmati rice with tender chicken'},
                    {'name': 'Mutton Biryani', 'price': 320, 'description': 'Premium mutton biryani'},
                    {'name': 'Fish Curry', 'price': 250, 'description': 'Spiced fish in coconut gravy'},
                    {'name': 'Paragon Biryanis Combo', 'price': 550, 'description': 'Chicken + Mutton + Naan'}
                ],
                'Devi Prasad': [
                    {'name': 'Puttu Curry', 'price': 120, 'description': 'Traditional Kerala puttu'},
                    {'name': 'Avial', 'price': 150, 'description': 'Mixed vegetables Kerala style'},
                    {'name': 'Appam with Stew', 'price': 180, 'description': 'Soft appam with chicken stew'},
                    {'name': 'Kerala Thali', 'price': 300, 'description': 'Complete Kerala meal'}
                ],
                'Hot Spot': [
                    {'name': 'Biryanis - Chicken', 'price': 250, 'description': 'Fragrant biryani'},
                    {'name': 'Murgh Makhani', 'price': 280, 'description': 'Creamy butter chicken'},
                    {'name': 'Tandoori Chicken', 'price': 350, 'description': 'Spiced grilled chicken'},
                    {'name': 'Mixed Grill', 'price': 450, 'description': 'Assorted kebabs and tandoori'}
                ],
                'Sree Bhagavathy Palace': [
                    {'name': 'Fish Biryanis', 'price': 280, 'description': 'Fresh fish biryani'},
                    {'name': 'Prawn Curry', 'price': 320, 'description': 'Cooking prawn in coconut gravy'},
                    {'name': 'Squid Fry', 'price': 300, 'description': 'Crispy squid fry'},
                    {'name': 'Seafood Special Thali', 'price': 400, 'description': 'Complete seafood meal'}
                ]
            }

            items = menus.get(rest_data['name'], [
                {'name': f'{rest_data["name"]} Special 1', 'price': 250, 'description': 'Popular item'},
                {'name': f'{rest_data["name"]} Special 2', 'price': 350, 'description': 'Premium item'},
                {'name': f'{rest_data["name"]} Special 3', 'price': 450, 'description': 'Deluxe item'},
            ])

            for item in items:
                menu_item = MenuItem(
                    restaurant=restaurant,
                    name=item['name'],
                    price=item['price'],
                    description=item['description'],
                    category=rest_data['category']
                )
                menu_item.save()

        logger.info("✅ Demo restaurants created")

    # Create demo admin if not exist
    if User.objects(role='admin').count() == 0:
        admin = User(
            username='admin',
            email='admin@fooddelivery.com',
            password_hash=PasswordSecurity.hash_password('admin123'),
            phone='9999999999',
            role='admin',
            is_verified=True,
            is_approved=True
        )
        admin.save()
        logger.info("✅ Admin created: admin@fooddelivery.com / admin123")

    # Create demo customer
    if User.objects(role='customer', username='customer').count() == 0:
        customer = User(
            username='customer',
            email='customer@fooddelivery.com',
            password_hash=None,  # Customers use Google login
            phone='8888888888',
            role='customer',
            is_verified=True,
            is_approved=True,
            google_id='mock_customer_demo'
        )
        customer.save()
        logger.info("✅ Demo customer created: customer@fooddelivery.com")

    # Create demo restaurant user
    if User.objects(role='restaurant', username='restaurant').count() == 0:
        rest_user = User(
            username='restaurant',
            email='rest@fooddelivery.com',
            password_hash=PasswordSecurity.hash_password('rest123'),
            phone='7777777777',
            role='restaurant',
            is_verified=True,
            is_approved=True
        )
        rest_user.save()
        logger.info("✅ Demo restaurant user created: rest@fooddelivery.com / rest123")

    # Create demo delivery partner
    if User.objects(role='delivery', username='delivery').count() == 0:
        delivery = User(
            username='delivery',
            email='delivery@fooddelivery.com',
            password_hash=PasswordSecurity.hash_password('delivery123'),
            phone='6666666666',
            role='delivery',
            is_verified=True,
            is_approved=True
        )
        delivery.save()
        logger.info("✅ Demo delivery partner created: delivery@fooddelivery.com / delivery123")
