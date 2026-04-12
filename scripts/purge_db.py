import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['FLASK_ENV'] = 'production'
from backend.app import create_app
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant, MenuItem
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.models.models import Order, Payment, Review, PromoCode, DeliveryAssignment, Notification, ChatMessage

def purge():
    app = create_app()
    with app.app_context():
        print("--- EXHAUSTIVE DATABASE PURGE ---")
        
        models = [
            Order, Payment, Review, PromoCode, 
            DeliveryAssignment, Notification, ChatMessage,
            MenuItem, Restaurant, DeliveryPartner, User
        ]
        
        for model in models:
            name = model.__name__
            count = model.objects.count()
            print(f"Deleting {count} records from {name}...")
            model.objects.delete()
            
        print("--- PURGE COMPLETE ---")

if __name__ == "__main__":
    purge()
