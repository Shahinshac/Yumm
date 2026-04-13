"""
Cleanup Stale Applications Script
Checks for pending registrations older than 48 hours, sends a rejection notice, and deletes them.
"""
import os
import sys
import logging
from datetime import datetime, timedelta
from mongoengine import connect

# Add the project root to sys.path to allow importing from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant, MenuItem
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.services.email_service import EmailService
from flask import Flask

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def cleanup_stale_applications(hours=48):
    # Setup Minimal Flask Context for Email Service
    app = Flask(__name__)
    app.config.update({
        'MAIL_SERVER': os.getenv('MAIL_SERVER', 'smtp.gmail.com'),
        'MAIL_PORT': int(os.getenv('MAIL_PORT', 587)),
        'MAIL_USE_TLS': os.getenv('MAIL_USE_TLS', 'true').lower() == 'true',
        'MAIL_USERNAME': os.getenv('MAIL_USERNAME', ''),
        'MAIL_PASSWORD': os.getenv('MAIL_PASSWORD', ''),
        'MAIL_DEFAULT_SENDER': os.getenv('MAIL_DEFAULT_SENDER', ''),
    })
    
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/fooddelivery')
    connect(host=mongo_uri)
    logger.info(f"Connected to MongoDB. Scanning for applications older than {hours} hours...")

    # Find stale, unapproved partners (restaurants and delivery only)
    threshold = datetime.utcnow() - timedelta(hours=hours)
    stale_users = User.objects(
        is_approved=False, 
        created_at__lt=threshold,
        role__in=['restaurant', 'delivery']
    )

    count = stale_users.count()
    if count == 0:
        logger.info("No stale applications found.")
        return

    logger.info(f"Found {count} stale applications. Processing cleanup...")

    for user in stale_users:
        logger.info(f"Processing stale application: {user.email} (Created: {user.created_at})")
        
        # 1. Send Rejection Email
        with app.app_context():
            from backend.app import mail
            mail.init_app(app)
            
            reason = f"Your application was not processed within the {hours}-hour review window and has been automatically closed."
            success = EmailService.send_rejection_email(user.email, user.full_name or user.username, reason)
            if success:
                logger.info(f"Rejection email sent to {user.email}")
            else:
                logger.warning(f"Failed to send rejection email to {user.email}")

        # 2. Delete Associated Data
        if user.role == 'restaurant':
            rest = Restaurant.objects(user=user).first()
            if rest:
                MenuItem.objects(restaurant=rest).delete()
                rest.delete()
        elif user.role == 'delivery':
            dp = DeliveryPartner.objects(user=user).first()
            if dp:
                dp.delete()
        
        # 3. Delete User
        user_email = user.email
        user.delete()
        logger.info(f"Permanently removed stale partner: {user_email}")

    logger.info(f"Cleanup complete. Removed {count} applications.")

if __name__ == "__main__":
    # Check for CLI argument for hours
    h = 48
    if len(sys.argv) > 1:
        try:
            h = int(sys.argv[1])
        except ValueError:
            pass
    
    cleanup_stale_applications(hours=h)
