# Banking System Architecture

## Overview
This is a layered Flask-based banking system with clear separation of concerns.

## Backend Structure

```
backend/
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── models/               # Database models (SQLAlchemy ORM)
│   │   ├── __init__.py
│   │   ├── user.py          # User and Role models
│   │   ├── account.py       # Bank Account model
│   │   ├── transaction.py   # Transaction model
│   │   ├── card.py          # Card model
│   │   ├── loan.py          # Loan model
│   │   ├── beneficiary.py   # Beneficiary model
│   │   ├── notification.py  # Notification model
│   │   └── payment.py       # Scheduled Payment model
│   │
│   ├── routes/              # API blueprints
│   │   ├── __init__.py
│   │   ├── auth.py          # Login, register, token refresh
│   │   ├── users.py         # User management
│   │   ├── accounts.py      # Account operations
│   │   ├── transactions.py  # Transaction endpoints
│   │   ├── cards.py         # Card management + ATM
│   │   ├── loans.py         # Loan operations
│   │   ├── beneficiaries.py # Beneficiary management
│   │   ├── notifications.py # Notification endpoints
│   │   └── admin.py         # Admin operations
│   │
│   ├── services/            # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py      # Authentication logic
│   │   ├── user_service.py      # User operations
│   │   ├── account_service.py   # Account logic
│   │   ├── transaction_service.py # Transaction processing
│   │   ├── card_service.py      # Card operations
│   │   ├── loan_service.py      # Loan calculations & processing
│   │   ├── beneficiary_service.py # Beneficiary logic
│   │   └── notification_service.py # Notification logic
│   │
│   ├── middleware/          # Authentication & Authorization
│   │   ├── __init__.py
│   │   ├── auth_middleware.py   # JWT validation
│   │   └── rbac.py              # Role-based access control
│   │
│   └── utils/               # Helper functions
│       ├── __init__.py
│       ├── validators.py    # Input validation
│       ├── security.py      # Password hashing, encryption
│       ├── generators.py    # Account number, card number, etc.
│       └── exceptions.py    # Custom exceptions
│
├── config.py                # Configuration management
├── run.py                   # Entry point
├── requirements.txt         # Dependencies
├── .env.example             # Environment template
└── .gitignore               # Git ignore rules
```

## Architecture Principles

### 1. **Layered Architecture**
- **Routes**: Handle HTTP requests/responses only (no business logic)
- **Services**: Contain all business logic (transactions, calculations, validations)
- **Models**: Database schema and ORM definitions
- **Middleware**: Authentication, authorization, request validation
- **Utils**: Reusable helpers (hashing, validation, generators)

### 2. **Separation of Concerns**
- Each module handles ONE responsibility
- Models don't contain business logic
- Routes don't have validation or calculations
- Services are independent and testable

### 3. **Database Design**
- PostgreSQL with proper relationships
- Foreign keys enforced
- Indexes on frequently queried columns
- Timestamps (created_at, updated_at) on all tables
- Atomic transactions for money operations

### 4. **Security**
- JWT for authentication
- Role-based access control (Admin, Manager, Staff, Customer)
- Password hashing with bcrypt
- PIN hashing for ATM/Cards
- Input validation at all entry points
- SQL injection prevention (ORM usage)

### 5. **Error Handling**
- Custom exceptions for domain errors
- Consistent error response format
- Proper HTTP status codes
- Detailed logging

## Development Sequence

1. ✅ Backend architecture (current)
2. Authentication system (JWT + RBAC)
3. User and account modules
4. Transaction system
5. Beneficiary system
6. Card and ATM module
7. Loan system
8. Scheduled payments
9. Notifications system
10. Admin tools and analytics
11. Frontend (React)

## Configuration Management

- **config.py**: Environment-specific settings
- **.env**: Local environment variables (not committed)
- **.env.example**: Template for required env vars

## No External APIs
- All banking operations are simulated
- No real RBI, UPI, or payment gateway integration
- Dedicated simulation for bills, transfers, etc.

