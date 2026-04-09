import os
from mongoengine import connect
from dotenv import load_dotenv
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

connect(host=os.getenv('MONGODB_URI'))

from app.models.user import User
from app.models.restaurant import Restaurant, MenuItem
from app.models.models import Order, Payment, Review, PromoCode, DeliveryAssignment, Notification, ChatMessage

print("Starting comprehensive database wipe...")

# Preserve admin users to allow subsequent login
admin_count = User.objects(role='admin').count()
print(f"Preserved {admin_count} admin accounts.")

# Delete all data
User.objects(role__ne='admin').delete()
Restaurant.objects().delete()
MenuItem.objects().delete()
Order.objects().delete()
Payment.objects().delete()
Review.objects().delete()
PromoCode.objects().delete()
DeliveryAssignment.objects().delete()
Notification.objects().delete()
ChatMessage.objects().delete()

# Clear activity for preserved admins if needed
User.objects(role='admin').update(
    last_login=None,
    last_activity=None,
    favorite_restaurants=[],
    saved_addresses=[]
)

print("✅ Database wipe complete. All models cleared except Admin users.")

