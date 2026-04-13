import sys
import os
sys.path.append(os.getcwd())
from backend.app import create_app
from backend.app.models.user import User
import bcrypt

def reset_admin():
    app = create_app()
    with app.app_context():
        # Look for existing admin by email or role
        admin = User.objects(role='admin').first()
        
        hashed_pw = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        if admin:
            print(f"Updating existing admin: {admin.email}")
            admin.update(set__password_hash=hashed_pw, set__email='admin', set__username='admin', set__is_approved=True)
        else:
            print("Creating new admin user")
            admin = User(
                username='admin',
                email='admin',
                password_hash=hashed_pw,
                role='admin',
                full_name='Super Admin',
                phone='0000000000',
                is_approved=True
            )
            admin.save()
        
        print("✅ Admin credentials reset to: admin / admin123")

if __name__ == '__main__':
    reset_admin()
