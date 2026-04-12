import sys
import os

# Add the project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

os.environ['FLASK_ENV'] = 'production' # Use production to hit actual DB from .env

from backend.app import create_app
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.utils.security import PasswordSecurity

def seed_test_data():
    app = create_app()
    with app.app_context():
        print("Seeding test data...")
        
        # 1. Admin
        if not User.objects(email='admin@yumm.com').first():
            User(
                username='admin_test',
                email='admin@yumm.com',
                password_hash=PasswordSecurity.hash_password('admin123'),
                role='admin',
                is_approved=True,
                is_verified=True,
                phone='1111111111'
            ).save()
            print("Created Admin: admin@yumm.com / admin123")
        
        # 2. Test Customer
        if not User.objects(email='testcust@yumm.com').first():
            User(
                username='test_customer',
                email='testcust@yumm.com',
                role='customer',
                is_approved=True,
                is_verified=True,
                phone='2222222222',
                password_hash=PasswordSecurity.hash_password('customer123') # Manual password for bypass login
            ).save()
            print("Created Customer: testcust@yumm.com / customer123")
            
        # 3. Pending Restaurant (For admin to approve)
        if not User.objects(email='pending_rest@yumm.com').first():
            user = User(
                username='pending_rest',
                email='pending_rest@yumm.com',
                password_hash=PasswordSecurity.hash_password('rest123'),
                role='restaurant',
                is_approved=False,
                phone='3333333333'
            ).save()
            Restaurant(
                user=user,
                name='Pending Grill',
                address='123 Test Ave',
                is_approved=False
            ).save()
            print("Created Pending Restaurant: pending_rest@yumm.com")

        # 4. Pending Delivery (For admin to approve)
        if not User.objects(email='pending_rider@yumm.com').first():
            user = User(
                username='pending_rider',
                email='pending_rider@yumm.com',
                password_hash=PasswordSecurity.hash_password('rider123'),
                role='delivery',
                is_approved=False,
                phone='4444444444'
            ).save()
            DeliveryPartner(
                user=user,
                phone='4444444444',
                vehicle_type='bike',
                is_active=True
            ).save()
            print("Created Pending Delivery: pending_rider@yumm.com")

        print("Seeding Complete.")

if __name__ == "__main__":
    seed_test_data()
