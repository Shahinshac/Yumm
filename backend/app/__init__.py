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

    # Initialize MongoDB connection LAZILY (in first request)
    app._mongodb_connected = False

    @app.before_request
    def init_mongodb():
        """Initialize MongoDB connection on first request"""
        if not app._mongodb_connected:
            try:
                from mongoengine import connect
                mongodb_settings = app.config.get("MONGODB_SETTINGS", {})
                if mongodb_settings:
                    connect(
                        db=mongodb_settings.get("db", "bankmanagement"),
                        host=mongodb_settings.get("host", "mongodb://localhost:27017/bankmanagement")
                    )
                    app.logger.info("MongoDB connected successfully")
                    app._mongodb_connected = True
            except Exception as e:
                app.logger.error(f"Failed to connect to MongoDB: {str(e)}")
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

    app.register_blueprint(auth_bp)
