# Banking System - Backend Architecture

## Layered Architecture Pattern

This application follows a **3-layer (Tri-layer) architecture pattern** for clean separation of concerns.

```
┌─────────────────────────────────────┐
│         Routes (API Endpoints)      │ ← HTTP requests come here
├─────────────────────────────────────┤
│         Services (Business Logic)   │ ← All calculations & validations
├─────────────────────────────────────┤
│         Models (Database Access)    │ ← Data persistence
└─────────────────────────────────────┘
```

## Folder Structure

```
backend/
├── app/                          # Main application package
│   ├── __init__.py              # Flask app factory
│   ├── models/                  # Database models (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── user.py              # User model (STEP 2)
│   │   ├── role.py              # Role model (STEP 2)
│   │   ├── account.py           # Account model (STEP 3)
│   │   ├── transaction.py       # Transaction model (STEP 4)
│   │   └── ...
│   │
│   ├── routes/                  # Flask blueprints (API endpoints)
│   │   ├── __init__.py
│   │   ├── auth.py              # Login, register (STEP 2)
│   │   ├── user.py              # User management (STEP 2)
│   │   ├── account.py           # Account operations (STEP 3)
│   │   ├── transaction.py       # Transactions (STEP 4)
│   │   └── ...
│   │
│   ├── services/                # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py      # Authentication logic (STEP 2)
│   │   ├── user_service.py      # User business logic (STEP 2)
│   │   ├── account_service.py   # Account operations (STEP 3)
│   │   ├── transaction_service.py  # Transaction logic (STEP 4)
│   │   └── ...
│   │
│   ├── middleware/              # Request/response processing
│   │   ├── __init__.py
│   │   ├── auth.py              # JWT verification (STEP 2)
│   │   └── error_handler.py     # Error handling
│   │
│   └── utils/                   # Helper functions
│       ├── __init__.py
│       ├── jwt_handler.py       # JWT creation/validation (STEP 2)
│       ├── password_hash.py     # Bcrypt hashing (STEP 2)
│       └── validators.py        # Input validation
│
├── database/                    # Database configuration
│   └── __init__.py
│
├── config.py                    # Configuration management
├── requirements.txt             # Python dependencies
├── run.py                       # Application entry point
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore rules
└── ARCHITECTURE.md              # This file
```

## Data Flow

### Example: Create Transaction

```
1. CLIENT SENDS REQUEST
   POST /api/transactions
   {account_id, amount, type: "withdraw"}
   ↓
2. ROUTE HANDLER (@app.route)
   - Receives request
   - Validates request format
   - Calls service layer
   ↓
3. SERVICE LAYER (transaction_service.py)
   - Business logic:
     * Check balance
     * Validate amount
     * Check account status
     * Create transaction record
     * Update account balance (atomic)
   - Calls model layer
   ↓
4. MODEL LAYER (models/transaction.py)
   - Database operations:
     * Insert transaction record
     * Update account balance
     * Ensure ACID properties
   ↓
5. RESPONSE SENT TO CLIENT
   Success: {transaction_id, status, amount}
   Error: {error_code, message}
```

## Key Principles

### 1. NO Business Logic in Routes
✗ BAD:
```python
@app.route('/withdraw', methods=['POST'])
def withdraw():
    amount = request.json['amount']
    account.balance -= amount  # Direct manipulation
    db.session.commit()
    return {'success': True}
```

✓ GOOD:
```python
@app.route('/withdraw', methods=['POST'])
def withdraw():
    amount = request.json['amount']
    result = transaction_service.process_withdrawal(account_id, amount)
    return result
```

### 2. Models Are Data-only
✗ BAD:
```python
class Account(db.Model):
    def calculate_interest(self):
        # Business logic in model
        self.balance += self.balance * 0.05
```

✓ GOOD:
```python
# Model: Pure data & schema
class Account(db.Model):
    balance = db.Column(db.Float, default=0)

# Service: Business logic
def calculate_interest(account):
    interest = account.balance * 0.05
    account.balance += interest
    db.session.commit()
```

### 3. Services Are Independent
- Each service module handles one domain (accounts, transactions, loans, etc.)
- Services call other services when needed (but avoid circular dependencies)
- Services use models for database operations

### 4. Routes Are Thin
- Only validate input format
- Call service
- Return response
- No database queries directly

## Database Transactions

For **critical operations** (money transfers, loan approval), use:

```python
from database import db

try:
    db.session.begin_nested()
    # Critical operations
    account.balance -= amount
    beneficiary.balance += amount
    db.session.commit()
except Exception as e:
    db.session.rollback()
    raise
```

## Step-by-Step Development

- **STEP 1** (Current): Architecture & Setup ✓
- **STEP 2**: Authentication (JWT + RBAC middleware)
- **STEP 3**: Users & Accounts
- **STEP 4**: Transactions
- **STEP 5**: Beneficiaries
- **STEP 6**: Cards & ATM
- **STEP 7**: Loans
- **STEP 8**: Scheduled Payments
- **STEP 9**: Notifications
- **STEP 10**: Admin & Analytics
- **STEP 11**: Frontend (React)

Each step builds on previous steps. Do not skip order.
