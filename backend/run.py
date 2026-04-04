"""
Entry point for the Flask application
"""
import os
import sys

# Add current directory to path for config imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from app import create_app, db

# Load environment variables from .env file
load_dotenv()

# Set environment
os.environ.setdefault("FLASK_ENV", "development")
app = create_app(os.getenv("FLASK_ENV", "development"))


@app.shell_context_processor
def make_shell_context():
    """Add objects to shell context for flask shell"""
    return {"db": db}


@app.cli.command("create-admin")
def create_admin():
    """Create initial admin user (shahinsha / 262007)"""
    from app.models.user import User, Role
    from app.utils.security import PasswordSecurity

    with app.app_context():
        # Check if admin role exists
        admin_role = Role.query.filter_by(name="admin").first()
        if not admin_role:
            print("❌ Admin role not found. Please run database initialization first.")
            return

        # Check if admin user already exists
        existing_admin = User.query.filter_by(username="shahinsha").first()
        if existing_admin:
            print("⚠️ Admin user 'shahinsha' already exists.")
            return

        # Create admin user
        admin_user = User(
            username="shahinsha",
            email="admin@26-07-reserve.bank",
            password_hash=PasswordSecurity.hash_password("262007"),
            first_name="Admin",
            last_name="User",
            phone_number="+91-9876543210",
            role_id=admin_role.id,
            is_active=True,
            is_verified=True,
            is_first_login=False  # Admin doesn't need to change password
        )

        db.session.add(admin_user)
        db.session.commit()

        print("✅ Admin user created successfully!")
        print(f"   Username: {admin_user.username}")
        print(f"   Password: 262007")
        print(f"   Email: {admin_user.email}")
        print(f"   Role: admin")


if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"], host="0.0.0.0", port=5000)
