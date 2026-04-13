import sys
import os
sys.path.append(os.getcwd())

from backend.app import create_app
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
import mongoengine

def debug_registration():
    app = create_app()
    with app.app_context():
        email = "debug_rest@test.com"
        # Cleanup
        User.objects(email=email).delete()
        
        try:
            print("Creating User...")
            user = User(
                username="debug_rest",
                email=email,
                phone="1234567890",
                full_name="Debug Owner",
                role="restaurant",
                is_approved=False
            )
            user.save()
            print("User saved.")
            
            print("Creating Restaurant...")
            restaurant = Restaurant(
                user=user,
                name="Debug Shop",
                address="Debug Address",
                category="Fine Dining",
                is_approved=False
            )
            restaurant.save()
            print("Restaurant saved.")
            
            print("✅ TEST SUCCESSFUL")
        except Exception as e:
            print(f"❌ ERROR: {type(e).__name__}: {str(e)}")
            if hasattr(e, 'to_dict'):
                print(e.to_dict())

if __name__ == '__main__':
    debug_registration()
