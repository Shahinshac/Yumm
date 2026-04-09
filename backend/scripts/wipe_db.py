"""
Database Wipe Script for FoodHub - Production Preparation
"""
import os
import sys
from dotenv import load_dotenv
from mongoengine import connect, get_connection

# Add the project root to sys.path so we can import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

load_dotenv()

def wipe_data():
    uri = os.getenv('MONGODB_URI')
    if not uri:
        print("❌ MONGODB_URI not found in environment")
        return

    print(f"Connecting to: {uri.split('@')[-1]}")
    connect(host=uri)
    
    try:
        from backend.app.models.user import User
        from backend.app.models.restaurant import Restaurant, MenuItem
        from backend.app.models.delivery_partner import DeliveryPartner
        from backend.app.models.models import Order, Payment

        print("🧹 Starting database wipe...")
        
        # 1. Delete all operational data
        orders_deleted = Order.objects().delete()
        print(f"   - Deleted {orders_deleted} orders")
        
        payments_deleted = Payment.objects().delete()
        print(f"   - Deleted {payments_deleted} payments")
        
        menu_items_deleted = MenuItem.objects().delete()
        print(f"   - Deleted {menu_items_deleted} menu items")
        
        restaurants_deleted = Restaurant.objects().delete()
        print(f"   - Deleted {restaurants_deleted} restaurants")
        
        partners_deleted = DeliveryPartner.objects().delete()
        print(f"   - Deleted {partners_deleted} delivery partners")
        
        # 2. Delete non-admin users
        # We keep admins so the user can still log in to manage the empty system
        users_deleted = User.objects(role__ne='admin').delete()
        print(f"   - Deleted {users_deleted} customers/partners")
        
        # 3. Ensure the main admin exists (Optional, but safe)
        # We won't recreate if it's already there to preserve any changed password
        admin_count = User.objects(role='admin').count()
        print(f"✅ Database wipe complete. {admin_count} admin accounts preserved.")
        
    except Exception as e:
        print(f"❌ Error during wipe: {str(e)}")

if __name__ == "__main__":
    confirm = input("ARE YOU SURE YOU WANT TO WIPE ALL OPERATIONAL DATA? (y/n): ")
    if confirm.lower() == 'y':
        wipe_data()
    else:
        print("Wipe cancelled.")
