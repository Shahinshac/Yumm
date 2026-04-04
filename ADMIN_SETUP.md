# Admin User Setup Guide - 26-07 RESERVE BANK

## Quick Setup

The initial admin user (`shahinsha` / `262007`) can be created in multiple ways:

### Option 1: Using the Setup Script (Recommended)

```bash
# From the project root
bash scripts/create_admin.sh
```

**Output:**
```
✅ Admin user created successfully!
   Username: shahinsha
   Password: 262007
   Email: admin@26-07-reserve.bank
   Role: admin
```

---

### Option 2: Using Flask CLI Command

```bash
# Navigate to backend directory
cd backend

# Create the admin user
flask create-admin
```

**Requirements:**
- Virtual environment activated (if using one)
- Database initialized
- Environment variables loaded from `.env`

---

### Option 3: Using Flask Shell

```bash
# From backend directory
flask shell

# Inside the Python shell:
>>> from app import db
>>> from app.models.user import User, Role
>>> from app.utils.security import PasswordSecurity

# Get admin role
>>> admin_role = Role.query.filter_by(name="admin").first()

# Create admin user
>>> admin = User(
...     username="shahinsha",
...     email="admin@26-07-reserve.bank",
...     password_hash=PasswordSecurity.hash_password("262007"),
...     first_name="Admin",
...     last_name="User",
...     phone_number="+91-9876543210",
...     role_id=admin_role.id,
...     is_active=True,
...     is_verified=True,
...     is_first_login=False
... )
>>> db.session.add(admin)
>>> db.session.commit()
>>> exit()
```

---

### Option 4: On Replit

1. Open Replit console
2. Run:
```bash
cd backend && flask create-admin
```

**How to access Replit console:**
- Once your Replit project is set up and running
- Click the "Shell" tab at the bottom of the screen
- Run the command above

---

### Option 5: Direct Python Script

Create `backend/scripts/setup_admin.py`:

```python
#!/usr/bin/env python
"""Direct admin user creation script"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app import create_app, db
from app.models.user import User, Role
from app.utils.security import PasswordSecurity

# Create app context
app = create_app()

with app.app_context():
    # Check if admin role exists
    admin_role = Role.query.filter_by(name="admin").first()
    if not admin_role:
        print("❌ Admin role not found!")
        sys.exit(1)

    # Check if user exists
    if User.query.filter_by(username="shahinsha").first():
        print("⚠️ Admin user already exists!")
        sys.exit(0)

    # Create admin
    admin = User(
        username="shahinsha",
        email="admin@26-07-reserve.bank",
        password_hash=PasswordSecurity.hash_password("262007"),
        first_name="Admin",
        last_name="User",
        phone_number="+91-9876543210",
        role_id=admin_role.id,
        is_active=True,
        is_verified=True,
        is_first_login=False
    )

    db.session.add(admin)
    db.session.commit()

    print("✅ Admin user created!")
    print(f"   Username: shahinsha")
    print(f"   Password: 262007")
```

Then run:
```bash
cd backend && python scripts/setup_admin.py
```

---

## Verification

After creating the admin user, verify it works:

### Via Login API

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@26-07-reserve.bank",
    "password": "262007"
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "shahinsha",
    "email": "admin@26-07-reserve.bank",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin",
    "is_first_login": false
  },
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

### Via Database Query

```bash
# In Flask shell:
flask shell
>>> from app.models.user import User
>>> admin = User.query.filter_by(username="shahinsha").first()
>>> print(admin.to_dict())
```

---

## Admin Capabilities

Once logged in as admin, you can:

### 1. Create Customer Accounts
```bash
curl -X POST http://localhost:5000/api/admin/customers \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+91-9876543210"
  }'
```

### 2. Reset Customer Passwords
```bash
curl -X POST http://localhost:5000/api/admin/customers/{customer_id}/reset-password \
  -H "Authorization: Bearer {access_token}"
```

### 3. Activate/Deactivate Customers
```bash
# Deactivate
curl -X POST http://localhost:5000/api/admin/customers/{customer_id}/deactivate \
  -H "Authorization: Bearer {access_token}"

# Activate
curl -X POST http://localhost:5000/api/admin/customers/{customer_id}/activate \
  -H "Authorization: Bearer {access_token}"
```

### 4. List Customers
```bash
curl http://localhost:5000/api/admin/customers \
  -H "Authorization: Bearer {access_token}"
```

---

## Troubleshooting

### "Admin role not found"
**Problem**: Admin role doesn't exist in database
**Solution**: Run database initialization first
```bash
# From backend directory
python init_db.py
# or
bash ../scripts/init_replit.sh
```

### "Admin user already exists"
**Problem**: User `shahinsha` is already in the database
**Solution**: Delete and recreate (or update password manually in Flask shell)

### "ModuleNotFoundError"
**Problem**: Dependencies not installed
**Solution**: Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### "Connection refused"
**Problem**: Database not running
**Solution**: Ensure PostgreSQL is running
```bash
# On Replit: automatic
# Local: psql or start your DB service
```

---

## Manual Password Change

If you need to change the admin password later:

```bash
flask shell
>>> from app.models.user import User
>>> from app.utils.security import PasswordSecurity
>>> admin = User.query.filter_by(username="shahinsha").first()
>>> admin.password_hash = PasswordSecurity.hash_password("new_password_here")
>>> db.session.commit()
>>> exit()
```

---

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION**

1. **Change Default Credentials**: Update the hardcoded password `262007` in:
   - This guide
   - `run.py` (modify the function or use environment variables)
   - Any setup scripts

2. **Use Environment Variables**:
```python
# Modify run.py to use env vars
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", os.environ.get("INITIAL_ADMIN_PASSWORD"))
```

3. **After Initial Setup**:
   - Log in with admin credentials
   - Create a new admin user with a strong password
   - Delete or disable the default `shahinsha` account
   - Update all passwords before deploying to production

---

## Next Steps

After creating the admin account:
1. ✅ Log in at `/login` with username `shahinsha` and password `262007`
2. ✅ Create customer accounts via the admin dashboard
3. ✅ Update your password (though not forced for admin)
4. ✅ Register additional staff/admin accounts if needed

Enjoy your secure banking system! 🏦
