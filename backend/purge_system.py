"""
Purge System Script - Wipes all data from MongoDB except the main admin account.
"""
from mongoengine import connect
import os
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/foodhub')

print(f"🔗 Connecting to: {MONGODB_URI}")
connect(host=MONGODB_URI)

# Import models
# Adjust paths if necessary
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant, MenuItem
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.models.models import Order, Review, Notification, Payment, PromoCode, DeliveryAssignment

ADMIN_EMAIL = "shahinsha@fooddelivery.com"

def purge():
    print("🚀 Starting Total System Purge...")
    
    # 1. Delete all users except Admin
    deleted_users = User.objects(email__ne=ADMIN_EMAIL).delete()
    print(f"✅ Deleted {deleted_users} users (Preserved {ADMIN_EMAIL})")
    
    # 2. Delete all restaurants
    deleted_rests = Restaurant.objects.delete()
    print(f"✅ Deleted {deleted_rests} restaurants")
    
    # 3. Delete all menu items
    deleted_items = MenuItem.objects.delete()
    print(f"✅ Deleted {deleted_items} menu items")
    
    # 4. Delete all delivery partners
    deleted_partners = DeliveryPartner.objects.delete()
    print(f"✅ Deleted {deleted_partners} delivery partners")
    
    # 5. Delete all orders
    deleted_orders = Order.objects.delete()
    print(f"✅ Deleted {deleted_orders} orders")
    
    # 6. Delete all reviews
    deleted_reviews = Review.objects.delete()
    print(f"✅ Deleted {deleted_reviews} reviews")
    
    # 7. Delete all notifications
    deleted_notifs = Notification.objects.delete()
    print(f"✅ Deleted {deleted_notifs} notifications")
    
    # 8. Delete all payments
    deleted_payments = Payment.objects.delete()
    print(f"✅ Deleted {deleted_payments} payments")

    # 9. Delete promo codes
    deleted_promos = PromoCode.objects.delete()
    print(f"✅ Deleted {deleted_promos} promo codes")

    # 10. Delete delivery assignments
    deleted_assigns = DeliveryAssignment.objects.delete()
    print(f"✅ Deleted {deleted_assigns} delivery assignments")

    print("\n✨ Purge Complete. System is now empty.")

if __name__ == "__main__":
    purge()
