"""
Flask application factory and initialization
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
import logging
from config import config


# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()


# Import models so relationships are defined
def _import_models():
    """Import all models to ensure relationships are defined"""
    from app.models.user import User, Role
    from app.models.account import Account
    from app.models.transaction import Transaction
    from app.models.base import Card, Beneficiary, Loan, LoanPayment, Notification, ScheduledPayment


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

    # Create app
    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config["default"]))

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # Configure CORS with environment-based origins
    cors_origins = app.config.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})

    # Import models (ensures relationships are defined)
    _import_models()

    # Setup logging
    _setup_logging(app)

    # Register error handlers
    _register_error_handlers(app)

    # Register blueprints
    _register_blueprints(app)

    # Database CLI commands
    _register_cli_commands(app)

    # Initialize default data
    with app.app_context():
        _initialize_default_data()

    app.logger.info(f"Application initialized in {config_name} mode")

    return app


def _setup_logging(app):
    """Configure logging"""
    if not app.debug:
        if not os.path.exists(app.config["LOG_DIR"]):
            os.makedirs(app.config["LOG_DIR"])

        file_handler = logging.FileHandler(
            os.path.join(app.config["LOG_DIR"], "banking_system.log")
        )
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
        db.session.rollback()
        return {"error": "Internal server error", "message": str(error)}, 500

    @app.errorhandler(BankingException)
    def handle_banking_exception(error):
        """Handle custom banking exceptions"""
        return {"error": error.message}, error.status_code


def _register_blueprints(app):
    """Register API blueprints"""
    from app.routes.auth_secure import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.users import users_bp
    from app.routes.accounts import accounts_bp
    from app.routes.transactions import transactions_bp
    from app.routes.beneficiaries import beneficiaries_bp
    from app.routes.cards import cards_bp, atm_bp
    from app.routes.loans import loans_bp
    from app.routes.scheduled_payments import scheduled_payments_bp
    from app.routes.notifications import notifications_bp
    from app.routes.analytics import analytics_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(accounts_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(beneficiaries_bp)
    app.register_blueprint(cards_bp)
    app.register_blueprint(atm_bp)
    app.register_blueprint(loans_bp)
    app.register_blueprint(scheduled_payments_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(analytics_bp)


def _initialize_default_data():
    """Initialize default data (roles, etc.) in database"""
    from app.services.auth_service import initialize_roles

    try:
        initialize_roles()
    except Exception as e:
        # Roles may already exist, which is fine
        pass


def _register_cli_commands(app):
    """Register CLI commands for database management"""

    @app.cli.command()
    def init_db():
        """Initialize the database"""
        db.create_all()
        print("Database initialized!")

    @app.cli.command()
    def drop_db():
        """Drop all database tables"""
        if input("Are you sure? (y/n): ").lower() == "y":
            db.drop_all()
            print("Database dropped!")

