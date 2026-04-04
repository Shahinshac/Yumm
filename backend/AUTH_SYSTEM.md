# Authentication System Documentation

## Overview
Complete JWT-based authentication system with Role-Based Access Control (RBAC).

## Features
- User registration with validation
- Login with username/email
- JWT access & refresh tokens
- Password hashing with bcrypt
- Role-based access control (Admin, Manager, Staff, Customer)
- Password change functionality
- Automatic role initialization

---

## API Endpoints

### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+91-9876543210"
}

Response (201):
{
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+91-9876543210",
        "role": "customer",
        "is_active": true,
        "is_verified": false,
        "created_at": "2024-04-04T03:22:14.123456"
    }
}
```

### 2. Login
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "john_doe",  // Can also use email
    "password": "SecurePass123"
}

Response (200):
{
    "user": { ... },
    "tokens": {
        "access_token": "eyJhbGc...",
        "refresh_token": "eyJhbGc...",
        "token_type": "Bearer"
    }
}
```

### 3. Refresh Access Token
```
POST /api/auth/refresh
Authorization: Bearer <refresh_token>

Response (200):
{
    "access_token": "eyJhbGc...",
    "token_type": "Bearer"
}
```

### 4. Get Current User
```
GET /api/auth/me
Authorization: Bearer <access_token>

Response (200):
{
    "user": { ... },
    "role": "customer"
}
```

### 5. Change Password
```
POST /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "old_password": "OldPass123",
    "new_password": "NewPass456"
}

Response (200):
{
    "message": "Password changed successfully"
}
```

---

## Security Components

### 1. Password Security (app/utils/security.py)
- **Hash**: bcrypt with 12 rounds
- **Verify**: Constant-time comparison
- **Method**: `PasswordSecurity.hash_password()`, `verify_password()`

### 2. PIN Security
- **Hash**: bcrypt like passwords
- **For**: ATM, Debit Cards
- **Method**: `PINSecurity.hash_pin()`, `verify_pin()`

### 3. Token Manager
- **Access Token**: 1 hour expiry
- **Refresh Token**: 7 days expiry
- **Claims**: user_id, username, role
- **Method**: `TokenManager.create_tokens()`

---

## Input Validation (app/utils/validators.py)

### Validation Rules
```python
Validators.validate_email(email)           # RFC standard
Validators.validate_password(password)     # Min 8 chars, uppercase, lowercase, digit
Validators.validate_username(username)     # 3-30 chars, alphanumeric + underscore
Validators.validate_phone(phone)           # 9-15 digits
Validators.validate_name(name)             # 2-100 chars
Validators.validate_pin(pin)               # Exactly 4 digits
```

---

## Role-Based Access Control

### Roles
1. **Admin** - Full system access, user management
2. **Manager** - Approve loans, manage staff, view reports
3. **Staff** - Create accounts, handle queries, support customers
4. **Customer** - Access own accounts, perform transactions

### Usage in Routes
```python
from app.middleware.rbac import require_role, require_authentication

# Admin only
@app.route('/admin-panel')
@require_role('admin')
def admin_panel():
    pass

# Admin and Manager
@app.route('/approvals')
@require_role('admin', 'manager')
def approvals():
    pass

# Any authenticated user
@app.route('/profile')
@require_authentication
def profile():
    pass
```

### Getting Current User
```python
from app.middleware.rbac import get_current_user

@app.route('/my-data')
@require_authentication
def get_my_data():
    user_info = get_current_user()
    # user_info = {
    #     "user_id": 1,
    #     "username": "john_doe",
    #     "role": "customer"
    # }
```

---

## Service Layer (app/services/auth_service.py)

### AuthService Methods
```python
# Register new user
user = AuthService.register_user(
    username="john_doe",
    email="john@example.com",
    password="SecurePass123",
    first_name="John",
    last_name="Doe",
    phone_number="+91-9876543210",
    role="customer"  # Optional, defaults to customer
)

# Login
result = AuthService.login(username="john_doe", password="SecurePass123")
# Returns: {"user": {...}, "tokens": {...}}

# Refresh token
tokens = AuthService.refresh_access_token(user_id=1)

# Get user
user = AuthService.get_user_by_id(user_id=1)

# Change password
AuthService.change_password(user_id=1, old_password="Old", new_password="New")
```

---

## Database Models

### User Model
```python
class User:
    id: int (PK)
    username: str (unique)
    email: str (unique)
    password_hash: str
    first_name: str
    last_name: str
    phone_number: str (unique)
    is_active: bool
    is_verified: bool
    role_id: int (FK → Role)
    last_login: datetime
    created_at: datetime
    updated_at: datetime
```

### Role Model
```python
class Role:
    id: int (PK)
    name: str (unique) - "admin", "manager", "staff", "customer"
    description: str
    created_at: datetime
    updated_at: datetime
```

---

## Error Handling

### Custom Exceptions
```python
from app.utils.exceptions import (
    AuthenticationError,        # 401
    AuthorizationError,         # 403
    ValidationError,            # 400
    ResourceNotFoundError,      # 404
    UserAlreadyExistsError      # 409
)
```

### Exception Flow
- Raised in Service layer
- Caught and formatted by routes
- Returned as JSON with appropriate HTTP status

---

## Testing

Run authentication setup tests:
```bash
python test_auth_setup.py
```

Tests coverage:
- Model imports and relationships ✓
- Utility functions ✓
- Security operations ✓
- Input validators ✓
- App factory ✓

---

## Implementation Checklist

✅ User & Role models
✅ Password hashing & verification
✅ JWT token creation & refresh
✅ Input validators
✅ Unique ID generators
✅ Authentication service (business logic)
✅ RBAC middleware
✅ Authentication routes
✅ Error handling
✅ Tests

## Next Steps

1. Test with PostgreSQL (currently using SQLite in-memory for testing)
2. Build User Management routes (get users, assign roles, etc.)
3. Build Account Management (create, list, manage accounts)
4. Continue with Transaction system

