import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['FLASK_ENV'] = 'production'
from backend.app import create_app
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.models.models import Order, DeliveryAssignment

def purge():
    app = create_app()
    with app.app_context():
        print("Purging database...")
        User.objects.delete()
        Restaurant.objects.delete()
        Order.objects.delete()
        DeliveryPartner.objects.delete()
        DeliveryAssignment.objects.delete()
        print("Purge Complete.")

if __name__ == "__main__":
    purge()
