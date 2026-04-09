"""
Flask Application Factory
Food Delivery App - Complete System with Professional Setup
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_mail import Mail
from mongoengine import connect, ConnectionFailure
import os
import logging
from datetime import timedelta

# Initialize extensions
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')
mail = Mail()


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
        raise RuntimeError(f"Could not connect to MongoDB: {error_str}")

    except Exception as e:
        error_str = str(e)
        logger.error(f"❌ Unexpected error during MongoDB connection: {error_str}")
        raise

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['JWT_SECRET_KEY'])

    # CORS
    origins_str = os.getenv('CORS_ORIGINS') or os.getenv('CORS_ORGINS')
    if origins_str:
        cors_origins = [origin.strip() for origin in origins_str.split(',') if origin.strip()]
    else:
        cors_origins = [
            "http://localhost:5173", 
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "https://yummfoodhub.vercel.app",
            "capacitor://localhost",
            "http://localhost"
        ]
        
    CORS(app, resources={r"/api/*": {
        "origins": cors_origins, 
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})
    logger.info(f"✅ CORS configured for origins: {cors_origins}")

    # Initialize extensions with app
    jwt.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")
    mail.init_app(app)
    
    logger.info("✅ Core extensions (JWT, SocketIO, Mail) initialized")

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

    # Register blueprints
    logger.info("Registering API blueprints...")

    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'Welcome to Yumm FoodHub API',
            'status': 'online',
            'version': '2.0.1'
        }), 200

    try:
        from backend.app.routes import (
            auth, customer, restaurant_dashboard, 
            delivery_dashboard, admin_dashboard, 
            notifications, restaurants, orders, 
            delivery, admin, reviews, promo,
            media # New media route
        )

        app.register_blueprint(auth.bp)
        app.register_blueprint(customer.bp)
        app.register_blueprint(restaurant_dashboard.bp)
        app.register_blueprint(delivery_dashboard.bp)
        app.register_blueprint(admin_dashboard.bp)
        app.register_blueprint(notifications.bp)
        app.register_blueprint(restaurants.bp)
        app.register_blueprint(orders.bp)
        app.register_blueprint(delivery.bp)
        app.register_blueprint(admin.bp)
        app.register_blueprint(reviews.bp)
        app.register_blueprint(promo.bp)
        app.register_blueprint(media.bp) # Media blueprint

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

    # Activity Tracking Hook
    @app.before_request
    def track_user_activity():
        try:
            from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
            from backend.app.models.user import User
            from datetime import datetime, timedelta

            try:
                verify_jwt_in_request(optional=True)
                user_id = get_jwt_identity()
            except:
                user_id = None

            if user_id:
                user = User.objects(id=user_id).first()
                if user:
                    now = datetime.utcnow()
                    if not user.last_activity or (now - user.last_activity) > timedelta(seconds=60):
                        user.last_activity = now
                        user.save()
        except:
            pass

    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found', 'status': 404}), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'status': 500}), 500

    logger.info("✅ FoodHub App initialized successfully!")
    return app
