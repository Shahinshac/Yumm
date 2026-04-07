"""
Configuration management for different environments
MongoDB + Professional Setup
"""
import os
from datetime import timedelta


class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

    # MongoDB Configuration - FoodDelivery Database
    MONGODB_SETTINGS = {
        'db': 'fooddelivery',
        'host': os.getenv('MONGODB_URI', 'mongodb://localhost:27017/fooddelivery'),
        'serverSelectionTimeoutMS': 5000,
        'connectTimeoutMS': 10000,
        'retryWrites': True,
        'w': 'majority'
    }

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    # CORS Configuration
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,https://yummfoodhub.vercel.app,https://frontend-mobile-r3kuj88ah-shahinshacs-projects.vercel.app"
    )

    # Security
    BCRYPT_LOG_ROUNDS = 12
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max request size

    # SMS Notifications (AWS SNS)
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_SNS_REGION = os.getenv("AWS_SNS_REGION", "us-east-1")
    AWS_SNS_PHONE_REGION = os.getenv("AWS_SNS_PHONE_REGION", "+91")
    ENABLE_SMS_NOTIFICATIONS = os.getenv("ENABLE_SMS_NOTIFICATIONS", "true").lower() == "true"

    # Logging Configuration
    LOG_DIR = os.getenv("LOG_DIR", "logs")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Pagination
    ITEMS_PER_PAGE = 20

    # API Rate Limiting
    RATELIMIT_ENABLED = os.getenv("RATELIMIT_ENABLED", "true").lower() == "true"
    RATELIMIT_DEFAULT = "100 per hour"


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    PROPAGATE_EXCEPTIONS = True


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    MONGODB_SETTINGS = {
        'db': 'fooddelivery_test',
        'host': 'mongodb://localhost:27017/fooddelivery_test',
        'serverSelectionTimeoutMS': 5000,
        'connectTimeoutMS': 10000
    }
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    # In production, ensure MONGODB_URI is set via environment variables
    MONGODB_SETTINGS = {
        'db': 'fooddelivery',
        'host': os.getenv('MONGODB_URI') or 'mongodb://localhost:27017/fooddelivery',
        'serverSelectionTimeoutMS': 5000,
        'connectTimeoutMS': 10000,
        'retryWrites': True,
        'w': 'majority'
    }
    RATELIMIT_ENABLED = True


# Configuration selection
config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": ProductionConfig,
}

