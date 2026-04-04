# API Quick Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Register
```
POST /auth/register

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+91-9876543210"
}

Response: 201
{
  "message": "User registered successfully",
  "user": { ...user data... }
}
```

### Login
```
POST /auth/login

{
  "username": "john_doe",    // or email
  "password": "SecurePass123"
}

Response: 200
{
  "user": { ...user data... },
  "tokens": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "token_type": "Bearer"
  }
}
```

### Refresh Token
```
POST /auth/refresh
Authorization: Bearer <refresh_token>

Response: 200
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer"
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <access_token>

Response: 200
{
  "user": { ...user data... },
  "role": "customer"
}
```

### Change Password
```
POST /auth/change-password
Authorization: Bearer <access_token>

{
  "old_password": "OldPass123",
  "new_password": "NewPass456"
}

Response: 200
{
  "message": "Password changed successfully"
}
```

---

## User Management

### List All Users (Admin/Manager)
```
GET /users?page=1&per_page=20
Authorization: Bearer <access_token>

Response: 200
{
  "users": [...],
  "total": 10,
  "pages": 1,
  "current_page": 1
}
```

### Get User Details
```
GET /users/<user_id>
Authorization: Bearer <access_token>

Response: 200
{
  "user": { ...user data... },
  "role": "customer"
}
```

### Update User (Admin Only)
```
PUT /users/<user_id>
Authorization: Bearer <access_token>

{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+91-9876543210",
  "is_active": true,
  "is_verified": true
}

Response: 200
{
  "message": "User updated successfully",
  "user": { ...updated user... }
}
```

### Assign Role (Admin Only)
```
POST /users/<user_id>/assign-role
Authorization: Bearer <access_token>

{
  "role": "manager"  // admin, manager, staff, customer
}

Response: 200
{
  "message": "Role assigned successfully",
  "user": { ...user data... },
  "role": "manager"
}
```

### Deactivate User (Admin Only)
```
POST /users/<user_id>/deactivate
Authorization: Bearer <access_token>

Response: 200
{
  "message": "User deactivated successfully",
  "user": { ...user data... }
}
```

### Activate User (Admin Only)
```
POST /users/<user_id>/activate
Authorization: Bearer <access_token>

Response: 200
{
  "message": "User activated successfully",
  "user": { ...user data... }
}
```

### Search Users (Admin/Manager/Staff)
```
GET /users/search?q=john&type=username
Authorization: Bearer <access_token>

Query Params:
- q: Search query (required)
- type: username | email | phone (default: username)

Response: 200
{
  "query": "john",
  "type": "username",
  "count": 1,
  "users": [...]
}
```

---

## Account Management

### Create Account (Staff/Admin Only)
```
POST /accounts
Authorization: Bearer <access_token>

{
  "user_id": 1,
  "account_type": "savings",     // savings, current, salary
  "initial_balance": 5000.00
}

Response: 201
{
  "message": "Account created successfully",
  "account": {
    "id": 1,
    "account_number": "982677845009883129",
    "account_type": "savings",
    "balance": 5000.00,
    "status": "active",
    "user_id": 1,
    "created_at": "2024-04-04T03:30:00"
  }
}
```

### List User Accounts
```
GET /accounts
Authorization: Bearer <access_token>

Query Params (optional):
- user_id: Get another user's accounts (Staff/Manager/Admin only)

Response: 200
{
  "user_id": 1,
  "count": 2,
  "accounts": [
    {
      "id": 1,
      "account_number": "982677845009883129",
      "account_type": "savings",
      "balance": 5000.00,
      "status": "active",
      "created_at": "2024-04-04T03:30:00"
    }
  ]
}
```

### Get Account Details
```
GET /accounts/<account_id>
Authorization: Bearer <access_token>

Response: 200
{
  "account": { ...account data... },
  "owner": { ...user data... }
}
```

### Get Account Balance
```
GET /accounts/<account_id>/balance
Authorization: Bearer <access_token>

Response: 200
{
  "account_number": "982677845009883129",
  "account_type": "savings",
  "balance": 5000.00,
  "status": "active"
}
```

### Get Account Status
```
GET /accounts/<account_id>/status
Authorization: Bearer <access_token>

Response: 200
{
  "account_number": "982677845009883129",
  "status": "active",
  "is_active": true,
  "is_frozen": false,
  "is_closed": false,
  "balance": 5000.00
}
```

### Freeze Account (Manager/Admin Only)
```
POST /accounts/<account_id>/freeze
Authorization: Bearer <access_token>

Response: 200
{
  "message": "Account frozen successfully",
  "account": { ...account with status: frozen... }
}
```

### Unfreeze Account (Manager/Admin Only)
```
POST /accounts/<account_id>/unfreeze
Authorization: Bearer <access_token>

Response: 200
{
  "message": "Account unfrozen successfully",
  "account": { ...account with status: active... }
}
```

### Close Account (Admin Only)
```
POST /accounts/<account_id>/close
Authorization: Bearer <access_token>

Note: Account balance must be 0

Response: 200
{
  "message": "Account closed successfully",
  "account": { ...account with status: closed... }
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input or validation failed"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+91-9876543210"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123"
  }'
```

### Create Account
```bash
curl -X POST http://localhost:5000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "user_id": 1,
    "account_type": "savings",
    "initial_balance": 5000
  }'
```

### Get Account Balance
```bash
curl -X GET http://localhost:5000/api/accounts/<account_id>/balance \
  -H "Authorization: Bearer <access_token>"
```
