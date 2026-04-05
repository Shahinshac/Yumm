"""
Create admin user for the banking system
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from app.models.user import User, Role
from app.utils.security import PasswordSecurity
from mongoengine import connect

# Connect to MongoDB
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://bankuser:bankpass123mongo@bank.5w2axma.mongodb.net/?appName=Bank')
connect(host=MONGODB_URI)

try:
    # Create roles if they don't exist
    admin_role = Role.objects(name='admin').first()
    if not admin_role:
        admin_role = Role(name='admin', description='Administrator with full access').save()
        print("✅ Created admin role")
    else:
        print("⚠️  Admin role already exists")

    customer_role = Role.objects(name='customer').first()
    if not customer_role:
        customer_role = Role(name='customer', description='Regular customer').save()
        print("✅ Created customer role")
    else:
        print("⚠️  Customer role already exists")

    staff_role = Role.objects(name='staff').first()
    if not staff_role:
        staff_role = Role(name='staff', description='Bank staff member').save()
        print("✅ Created staff role")
    else:
        print("⚠️  Staff role already exists")

    # Create admin user
    admin = User.objects(username='shahinsha').first()
    if admin:
        print("\n⚠️  Admin user already exists")
    else:
        password_hash = PasswordSecurity.hash_password('262007')
        admin = User(
            username='shahinsha',
            email='admin@26-07-reserve.bank',
            first_name='Shahinsha',
            last_name='Admin',
            phone_number='+91-9999999999',
            password_hash=password_hash,
            role=admin_role,
            is_active=True,
            is_verified=True,
            is_first_login=False
        )
        admin.save()
        print("\n✅ Admin user created successfully!")
        print("   Username: shahinsha")
        print("   Password: 262007")
        print("   Email: admin@26-07-reserve.bank")
        print("   Role: admin")

    print("\n✅ Database setup complete!")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
