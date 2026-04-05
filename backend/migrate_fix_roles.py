#!/usr/bin/env python
"""
Migration script to fix invalid role values in database
Converts 'manager' role to 'admin' and any other invalid roles to 'customer'
"""
import os
import sys
from mongoengine import connect
from app.models.user import User

def migrate_roles():
    """Fix invalid role values in database"""

    # Get MongoDB connection details from environment
    mongodb_uri = os.getenv(
        "MONGODB_URI",
        "mongodb://localhost:27017/bankmanagement"
    )

    try:
        # Connect to MongoDB
        connect(
            host=mongodb_uri,
            serverSelectionTimeoutMS=10000
        )
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return False

    # List of valid roles
    valid_roles = ["admin", "staff", "customer"]

    # Role mapping for invalid values
    role_mapping = {
        "manager": "admin",  # manager → admin
    }

    try:
        print("\n📋 Scanning for invalid roles...")
        all_users = User.objects()
        print(f"Total users in database: {all_users.count()}")

        fixed_count = 0

        for user in all_users:
            if user.role not in valid_roles:
                old_role = user.role
                new_role = role_mapping.get(user.role, "customer")

                print(f"\n  User: {user.username}")
                print(f"    Invalid role: {old_role}")
                print(f"    Changing to: {new_role}")

                user.role = new_role
                user.save()
                fixed_count += 1

        if fixed_count == 0:
            print("\n✅ No invalid roles found in database")
        else:
            print(f"\n✅ Fixed {fixed_count} user(s) with invalid roles")

        # Verify all users now have valid roles
        print("\n🔍 Verification:")
        for user in User.objects():
            if user.role not in valid_roles:
                print(f"  ❌ STILL INVALID: {user.username} = {user.role}")
                return False

        print("  ✅ All users have valid roles")
        return True

    except Exception as e:
        print(f"❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = migrate_roles()
    sys.exit(0 if success else 1)
