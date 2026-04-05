"""
Flask application factory and initialization
MongoDB Configuration
"""
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
import logging

# Initialize extensions
jwt = JWTManager()

# Dummy db object for backward compatibility with existing code
class DummyDB:
    """Placeholder for SQLAlchemy db - not used with MongoDB"""
    pass

db = DummyDB()


def create_app(config_name=None):
    """
    Application factory pattern

    Args:
        config_name: Configuration environment (development, testing, production)

    Returns:
        Configured Flask application
    """
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    # Import config
    from config import config

    # Create app
    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config["default"]))

    # OPTIMIZED: Initialize MongoDB connection at STARTUP instead of first request
    # This prevents the 3-5 second delay on first API call
    try:
        from mongoengine import connect
        mongodb_settings = app.config.get("MONGODB_SETTINGS", {})
        if mongodb_settings:
            connect(
                db=mongodb_settings.get("db", "bankmanagement"),
                host=mongodb_settings.get("host", "mongodb://localhost:27017/bankmanagement"),
                maxPoolSize=50,  # Connection pooling for better performance
                minPoolSize=10,
                maxIdleTimeMS=45000,
                serverSelectionTimeoutMS=5000
            )
            app.logger.info("✅ MongoDB connected successfully at startup")
        else:
            app.logger.warning("⚠️ MongoDB settings not found, using defaults")
    except Exception as e:
        app.logger.error(f"❌ Failed to connect to MongoDB: {str(e)}")
        # Don't fail the entire app, just log the error

    # Initialize JWT
    jwt.init_app(app)

    # Configure CORS with environment-based origins
    cors_origins = app.config.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})

    # Setup logging
    _setup_logging(app)

    # Register error handlers
    _register_error_handlers(app)

    # Register blueprints
    _register_blueprints(app)

    # CRITICAL: Ensure default admin exists
    _ensure_admin_exists(app)

    # AUTO-HEAL: Fix any invalid roles in database
    _fix_invalid_roles(app)

    app.logger.info(f"Application initialized in {config_name} mode")

    return app


def _setup_logging(app):
    """Configure logging"""
    if not app.debug:
        if not os.path.exists("logs"):
            os.makedirs("logs")

        file_handler = logging.FileHandler("logs/banking_system.log")
        file_handler.setLevel(logging.INFO)

        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        file_handler.setFormatter(formatter)
        app.logger.addHandler(file_handler)


def _register_error_handlers(app):
    """Register global error handlers"""
    from app.utils.exceptions import BankingException

    @app.errorhandler(400)
    def bad_request(error):
        return {"error": "Bad request", "message": str(error)}, 400

    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Not found", "message": str(error)}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error", "message": str(error)}, 500

    @app.errorhandler(BankingException)
    def handle_banking_exception(error):
        """Handle custom banking exceptions"""
        return {"error": error.message}, error.status_code


def _register_blueprints(app):
    """Register API blueprints"""
    from app.routes.auth_secure import auth_bp
    from app.routes.users import users_bp
    from app.routes.accounts import accounts_bp
    from app.routes.transactions import transactions_bp
    from app.routes.loans import loans_bp
    from app.routes.beneficiaries import beneficiaries_bp
    from app.routes.cards import cards_bp, atm_bp
    from app.routes.scheduled_payments import scheduled_payments_bp
    from app.routes.bills import bills_bp
    from app.routes.notifications import notifications_bp
    from app.routes.analytics import analytics_bp
    from app.routes.admin import admin_bp
    from app.routes.messages import messages_bp
    
    # NEW: Role-specific routes
    from app.routes.admin_routes import admin_routes
    from app.routes.staff_routes import staff_routes
    from app.routes.customer_routes import customer_routes

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(accounts_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(loans_bp)
    app.register_blueprint(beneficiaries_bp)
    app.register_blueprint(cards_bp)
    app.register_blueprint(atm_bp)
    app.register_blueprint(scheduled_payments_bp)
    app.register_blueprint(bills_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(messages_bp)

    # Register role-specific routes
    app.register_blueprint(admin_routes)
    app.register_blueprint(staff_routes)
    app.register_blueprint(customer_routes)


def _ensure_admin_exists(app):
    """
    Ensure default admin user exists on app startup

    If no admin exists, creates:
        - username: shahinsha
        - email: admin@26-07-reserve.bank
        - password: 262007
    """
    try:
        from app.services.auth_service import ensure_default_admin_exists

        result = ensure_default_admin_exists()
        if result.get("created"):
            app.logger.info(f"✅ Default admin created: {result['admin']['username']}")
        else:
            app.logger.info(f"✅ Admin already exists")
    except Exception as e:
        app.logger.error(f"❌ Failed to ensure admin exists: {str(e)}")


def _fix_invalid_roles(app):
    """
    AUTO-HEAL: Fix any users with invalid roles in database

    This runs on every app startup to automatically fix invalid role values.
    Converts 'manager' → 'admin', other invalid values → 'customer'
    """
    try:
        from app.models.user import User

        valid_roles = ["admin", "staff", "customer"]
        role_mapping = {"manager": "admin"}

        # Find users with invalid roles
        all_users = User.objects()
        fixed_count = 0

        for user in all_users:
            if user.role not in valid_roles:
                old_role = user.role
                new_role = role_mapping.get(user.role, "customer")

                user.role = new_role
                user.save()
                fixed_count += 1

                app.logger.warning(
                    f"🔧 Fixed invalid role for user '{user.username}': "
                    f"'{old_role}' → '{new_role}'"
                )

        if fixed_count > 0:
            app.logger.info(f"✅ Fixed {fixed_count} user(s) with invalid roles")

    except Exception as e:
        app.logger.error(f"❌ Failed to fix invalid roles: {str(e)}")
