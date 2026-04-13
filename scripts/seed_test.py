import sys
import os
sys.path.append(os.getcwd())

from backend.app import create_app
from backend.app.models.user import User

def seed_test_data():
    app = create_app()
    with app.app_context():
        email = "testcustomer@example.com"
        user = User.objects(email=email).first()
        if user:
            print(f"Updating existing test customer: {email}")
            user.update(set__google_id="mock_google_12345", set__role="customer", set__is_approved=True)
        else:
            print("Creating new test customer")
            user = User(
                username="test_customer",
                email=email,
                phone="0000000000",
                full_name="Test Customer",
                role="customer",
                is_approved=True,
                is_verified=True,
                google_id="mock_google_12345"
            )
            user.save()
        print("✅ Test customer seeded.")

if __name__ == '__main__':
    seed_test_data()
