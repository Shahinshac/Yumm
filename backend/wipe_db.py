import os
from mongoengine import connect
from dotenv import load_dotenv
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

connect(host=os.getenv('MONGODB_URI'))

from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.models.models import Order, Payment, Review

# Ensure admin doesn't get deleted
admin_count = User.objects(role='admin').count()
print(f"Admins exist: {admin_count}")

# Delete non-admin users
User.objects(role__ne='admin').delete()
Restaurant.objects().delete()
DeliveryPartner.objects().delete()
Order.objects().delete()
Payment.objects().delete()
Review.objects().delete()

print("Database wipe complete.")
