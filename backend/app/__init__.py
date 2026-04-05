"""
Flask Application Factory
26-07 RESERVE BANK - Digital Banking System
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from mongoengine import connect, disconnect
import os
from datetime import timedelta

jwt = JWTManager()

def create_app():
    """Application factory"""
    app = Flask(__name__)

    # Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

    # MongoDB
    db_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/bankmanagement')
    connect(host=db_uri, serverSelectionTimeoutMS=5000)
    print(f"✅ MongoDB connected: {db_uri.split('@')[-1] if '@' in db_uri else 'local'}")

    # CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # JWT
    jwt.init_app(app)

    # Register blueprints
    from backend.app.routes import auth, users, accounts, transactions, loans, cards, bills

    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(accounts.bp)
    app.register_blueprint(transactions.bp)
    app.register_blueprint(loans.bp)
    app.register_blueprint(cards.bp)
    app.register_blueprint(bills.bp)

    # Create default admin
    ensure_admin_exists()

    return app

def ensure_admin_exists():
    """Create default admin if none exists"""
    from backend.app.models.user import User
    from backend.app.utils.security import PasswordSecurity

    admin = User.objects(role='admin').first()
    if not admin:
        User.objects.create(
            username='shahinsha',
            email='admin@bank.com',
            password_hash=PasswordSecurity.hash_password('262007'),
            first_name='Admin',
            last_name='User',
            role='admin',
            is_active=True
        )
        print("✅ Default admin created: shahinsha/262007")
