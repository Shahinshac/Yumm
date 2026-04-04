# STEP 3: User & Account Management

## Overview
Complete user and account management system with RBAC-based operations.

---

## User Management

### UserService Methods

#### 1. Get All Users
```python
UserService.get_all_users(page=1, per_page=20) → dict
```
- **Roles**: Admin, Manager
- **Returns**: List of users with pagination
- **Source**: `app/services/user_service.py:19`

#### 2. Get User by ID
```python
UserService.get_user_by_id(user_id: int) → User
```
- **Returns**: User object
- **Raises**: ResourceNotFoundError if user not found
- **Source**: `app/services/user_service.py:47`

#### 3. Get User by Username
```python
UserService.get_user_by_username(username: str) → User
```
- **Returns**: User object
- **Source**: `app/services/user_service.py:69`

#### 4. Get User by Email
```python
UserService.get_user_by_email(email: str) → User
```
- **Returns**: User object
- **Source**: `app/services/user_service.py:89`

#### 5. Update User
```python
UserService.update_user(user_id: int, **kwargs) → User
```
- **Allowed fields**: first_name, last_name, phone_number, is_active, is_verified
- **Returns**: Updated user
- **Validates**: Phone uniqueness, name format
- **Source**: `app/services/user_service.py:109`

#### 6. Assign Role
```python
UserService.assign_role(user_id: int, role_name: str) → User
```
- **Valid roles**: admin, manager, staff, customer
- **Returns**: Updated user with new role
- **Source**: `app/services/user_service.py:165`

#### 7. Deactivate User
```python
UserService.deactivate_user(user_id: int) → User
```
- **Effect**: Sets is_active = False
- **Returns**: Updated user
- **Source**: `app/services/user_service.py:189`

#### 8. Activate User
```python
UserService.activate_user(user_id: int) → User
```
- **Effect**: Sets is_active = True
- **Returns**: Updated user
- **Source**: `app/services/user_service.py:203`

#### 9. Search Users
```python
UserService.search_users(query: str, search_type: str = "username") → list
```
- **Types**: username, email, phone
- **Returns**: List of matching users
- **Source**: `app/services/user_service.py:217`

### User Routes

```python
GET /api/users                      # List all users (pagination)
GET /api/users/<id>                 # Get user details
PUT /api/users/<id>                 # Update user (admin only)
POST /api/users/<id>/assign-role    # Assign role (admin only)
POST /api/users/<id>/deactivate     # Deactivate user (admin only)
POST /api/users/<id>/activate       # Activate user (admin only)
GET /api/users/search               # Search users (q, type params)
```

All implemented in `app/routes/users.py`

---

## Account Management

### AccountService Methods

#### 1. Create Account
```python
AccountService.create_account(
    user_id: int,
    account_type: str = "savings",
    initial_balance: float = 0.0
) → Account
```
- **Account types**: savings, current, salary
- **Auto-generates**: Unique 18-digit account number
- **Returns**: Created account
- **Raises**: ValidationError if invalid
- **Source**: `app/services/account_service.py:20`

#### 2. Get Account by ID
```python
AccountService.get_account_by_id(account_id: int) → Account
```
- **Returns**: Account object
- **Source**: `app/services/account_service.py:90`

#### 3. Get Account by Number
```python
AccountService.get_account_by_number(account_number: str) → Account
```
- **Returns**: Account object
- **Source**: `app/services/account_service.py:107`

#### 4. Get User Accounts
```python
AccountService.get_user_accounts(user_id: int) → list
```
- **Returns**: List of accounts for user
- **Order**: By creation date (newest first)
- **Source**: `app/services/account_service.py:122`

#### 5. Get Account Balance
```python
AccountService.get_account_balance(account_id: int) → dict
```
- **Returns**: {account_number, account_type, balance, status}
- **Source**: `app/services/account_service.py:141`

#### 6. Update Balance
```python
AccountService.update_balance(
    account_id: int,
    amount: float,
    operation: str = "add"  # "add" or "deduct"
) → Account
```
- **Operations**: add, deduct
- **Validates**: Sufficient balance for deduct
- **Returns**: Updated account
- **Raises**: InsufficientBalanceError
- **Source**: `app/services/account_service.py:156`

#### 7. Freeze Account
```python
AccountService.freeze_account(account_id: int) → Account
```
- **Effect**: Status → frozen (blocks transactions)
- **Returns**: Updated account
- **Source**: `app/services/account_service.py:187`

#### 8. Unfreeze Account
```python
AccountService.unfreeze_account(account_id: int) → Account
```
- **Effect**: Status → active
- **Returns**: Updated account
- **Source**: `app/services/account_service.py:207`

#### 9. Close Account
```python
AccountService.close_account(account_id: int) → Account
```
- **Requirements**: Balance must be 0
- **Effect**: Status → closed (permanent)
- **Returns**: Updated account
- **Raises**: ValidationError if has balance
- **Source**: `app/services/account_service.py:225`

#### 10. Get Account Status
```python
AccountService.get_account_status(account_id: int) → dict
```
- **Returns**: {account_number, status, is_active, is_frozen, is_closed, balance}
- **Source**: `app/services/account_service.py:251`

#### 11. Generate Unique Account Number
```python
AccountService._generate_unique_account_number() → str
```
- **Format**: 18 digits (98 + YY + 14 random)
- **Uniqueness**: Checks database
- **Returns**: Unique account number
- **Source**: `app/services/account_service.py:77`

### Account Routes

```python
POST /api/accounts                      # Create account (staff/admin only)
GET /api/accounts                       # List user's accounts
GET /api/accounts/<id>                  # Get account details
GET /api/accounts/<id>/balance          # Get balance
GET /api/accounts/<id>/status           # Get account status
POST /api/accounts/<id>/freeze          # Freeze account (manager/admin only)
POST /api/accounts/<id>/unfreeze        # Unfreeze account (manager/admin only)
POST /api/accounts/<id>/close           # Close account (admin only)
```

All implemented in `app/routes/accounts.py`

---

## Authorization Rules

### User Routes
| Endpoint | GET | LIST | POST | PUT | DELETE |
|----------|-----|------|------|-----|--------|
| /users | Own or Admin/Manager | Admin/Manager | Admin | Admin | - |
| /assign-role | - | - | Admin | - | - |
| /activate | - | - | Admin | - | - |
| /deactivate | - | - | Admin | - | - |

### Account Routes
| Endpoint | Auth | List | Create | Get | Freeze | Unfreeze | Close |
|----------|------|------|--------|-----|--------|----------|-------|
| /accounts | Own/Admin/Manager/Staff | - | Staff/Admin | Own/Admin | Manager/Admin | Manager/Admin | Admin |
| /balance | Own/Admin/Manager/Staff | - | - | - | - | - | - |
| /status | Own/Admin/Manager/Staff | - | - | - | - | - | - |

---

## Testing

### Test Coverage
- **File**: `test_user_account.py`
- **Total Tests**: 28
- **Pass Rate**: 100%
- **Execution Time**: ~1.5 seconds

### Test Classes
1. **TestUserService** (13 tests)
   - CRUD operations
   - Role assignment
   - Search functionality
   - Activation/deactivation

2. **TestAccountService** (15 tests)
   - Account creation
   - Balance operations
   - Account status transitions
   - Uniqueness validation

### Run Tests
```bash
cd backend
python -m pytest test_user_account.py -v
```

---

## Error Handling

### Custom Exceptions
- `ValidationError` (400) - Invalid input/operation
- `ResourceNotFoundError` (404) - User/Account not found
- `AuthorizationError` (403) - Access denied
- `InsufficientBalanceError` (400) - Not enough balance
- `DuplicateResourceError` (409) - Already exists

### Example Error Response
```json
{
  "error": "Insufficient balance. Available: 100, Required: 500"
}
```

---

## Database Models

### User Model
```
id, username, email, password_hash, first_name, last_name,
phone_number, is_active, is_verified, role_id (FK),
created_at, updated_at, last_login
```

### Role Model
```
id, name, description, created_at, updated_at
```

### Account Model
```
id, account_number (unique), account_type, balance (Decimal),
status, user_id (FK), created_at, updated_at
```

---

## Key Validations

### User Input
- Email format (RFC standard)
- Password strength (8+ chars, uppercase, lowercase, digit)
- Username format (3-30 chars, alphanumeric + underscore)
- Phone number (9-15 digits)
- Name fields (2-100 chars, letters only)

### Account Operations
- Account type must be valid (savings/current/salary)
- Initial balance cannot be negative
- Account number must be unique
- Cannot close account with balance > 0
- Cannot unfreeze already active account
- Cannot deduct more than available balance

---

## Next Steps: STEP 4 (Transaction System)

Will implement:
- Deposit operation
- Withdraw operation
- Transfer between accounts
- Transaction history
- Transaction validation
- Atomic database transactions
