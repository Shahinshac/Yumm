"""
Utility script to wipe orders and delivery assignments for testing.
RUN THIS FROM THE ROOT DIRECTORY: python backend/scripts/wipe_test_data.py
"""
import sys
import os

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app import create_app
from backend.app.models.models import Order, Payment, DeliveryAssignment, Notification, ChatMessage
from backend.app.models.delivery_partner import DeliveryPartner

def wipe_data():
    app = create_app()
    with app.app_context():
        print("🧹 Wiping test data...")
        
        # Count original data
        order_count = Order.objects.count()
        payment_count = Payment.objects.count()
        assign_count = DeliveryAssignment.objects.count()
        
        # Delete related collections
        Order.objects.delete()
        Payment.objects.delete()
        DeliveryAssignment.objects.delete()
        Notification.objects.delete()
        ChatMessage.objects.delete()
        
        # Reset delivery partners
        for dp in DeliveryPartner.objects:
            dp.is_available = True
            dp.is_online = False
            dp.total_deliveries = 0
            dp.save()
            
        print(f"✅ Deleted {order_count} Orders, {payment_count} Payments, and {assign_count} Delivery Assignments.")
        print(f"✅ Reset {DeliveryPartner.objects.count()} Delivery Partners to online=False, available=True.")
        print("🚀 System ready for a fresh test run.")

if __name__ == "__main__":
    confirm = input("Are you sure you want to delete ALL orders and reset all delivery partners? (y/n): ")
    if confirm.lower() == 'y':
        wipe_data()
    else:
        print("Operation cancelled.")
