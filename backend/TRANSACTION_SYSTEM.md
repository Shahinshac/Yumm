# STEP 4: Transaction System

## Overview
Complete transaction management system supporting deposits, withdrawals, and inter-account transfers with atomicity guarantees.

---

## Core Operations

### 1. Deposit
```python
TransactionService.deposit(
    account_id: int,
    amount: float,
    description: str = ""
) → Transaction
```

**Functionality**:
- Add money to account
- Creates transaction record
- Updates account balance
- Auto-generates reference ID

**Example**:
```python
txn = TransactionService.deposit(account_id=1, amount=5000, description="Salary")
# Returns: Transaction object
```

**Validation**:
- Amount must be > 0
- Account must exist

---

### 2. Withdrawal
```python
TransactionService.withdraw(
    account_id: int,
    amount: float,
    description: str = ""
) → Transaction
```

**Functionality**:
- Remove money from account
- Validates sufficient balance
- Creates transaction record
- Updates account balance

**Example**:
```python
txn = TransactionService.withdraw(account_id=1, amount=1000)
# Raises InsufficientBalanceError if balance < 1000
```

**Validation**:
- Amount must be > 0
- Sufficient balance required
- Account must exist

---

### 3. Transfer (Atomic)
```python
TransactionService.transfer(
    from_account_id: int,
    to_account_id: int,
    amount: float,
    description: str = ""
) → dict
```

**Functionality**:
- Transfer money between accounts
- ATOMIC operation (both succeed or both fail)
- Creates two linked transactions (debit + credit)
- Same reference_id for both transactions
- Updates both account balances

**Example**:
```python
result = TransactionService.transfer(
    from_account_id=1,
    to_account_id=2,
    amount=5000,
    description="Payment to John"
)

# Returns:
# {
#   "reference_id": "TXN202604040328359MBGZICJ",
#   "from_transaction": {...},
#   "to_transaction": {...},
#   "status": "completed"
# }
```

**Key Features**:
- **Atomic**: Both debit/credit happen together or not at all
- **Linked**: Both transactions have same reference_id
- **Validation**: Insufficient balance rolls back both
- **Safe**: No partial transfers

**Validation**:
- Amount must be > 0
- Sufficient balance in source account
- Cannot transfer to same account
- Both accounts must exist

---

## Transaction Retrieval

### 4. Get Single Transaction
```python
TransactionService.get_transaction(transaction_id: int) → Transaction
```

**Returns**: Transaction object with all details

---

### 5. Get Account Transactions (Paginated)
```python
TransactionService.get_account_transactions(
    account_id: int,
    transaction_type: str = None,      # "deposit", "withdrawal", "transfer"
    start_date: datetime = None,
    end_date: datetime = None,
    page: int = 1,
    per_page: int = 20
) → dict
```

**Returns**:
```python
{
    "account_id": 1,
    "account_number": "982677845009883129",
    "total": 100,
    "pages": 5,
    "current_page": 1,
    "transactions": [...]
}
```

**Filters**:
- `transaction_type`: Filter by type
- `start_date`: Include from this date
- `end_date`: Include until this date
- Pagination: page, per_page

---

### 6. Get User Transactions
```python
TransactionService.get_user_transactions(
    user_id: int,
    transaction_type: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    page: int = 1,
    per_page: int = 20
) → dict
```

**Returns**: All transactions across all user's accounts (same structure as account transactions)

---

### 7. Get Transaction Summary
```python
TransactionService.get_transaction_summary(
    account_id: int,
    days: int = 30
) → dict
```

**Returns**:
```python
{
    "account_id": 1,
    "period_days": 30,
    "transaction_count": 15,
    "deposits": {
        "count": 5,
        "total": 25000
    },
    "withdrawals": {
        "count": 8,
        "total": 12000
    },
    "transfers_incoming": {
        "count": 2,
        "total": 5000
    },
    "transfers_outgoing": {
        "count": 3,
        "total": 8000
    },
    "net_change": 10000,        # in - out + transfers
    "current_balance": 45000
}
```

---

## API Endpoints

### Deposit
```
POST /api/transactions/deposit
Authorization: Bearer <access_token>

{
    "account_id": 1,
    "amount": 5000,
    "description": "Monthly salary"  # Optional
}

Response (201):
{
    "message": "Deposit successful",
    "transaction": { ...transaction data... },
    "new_balance": 15000
}
```

### Withdraw
```
POST /api/transactions/withdraw
Authorization: Bearer <access_token>

{
    "account_id": 1,
    "amount": 1000,
    "description": "ATM withdrawal"  # Optional
}

Response (201):
{
    "message": "Withdrawal successful",
    "transaction": { ...transaction data... },
    "new_balance": 14000
}
```

### Transfer
```
POST /api/transactions/transfer
Authorization: Bearer <access_token>

{
    "from_account_id": 1,
    "to_account_id": 2,
    "amount": 5000,
    "description": "Payment to John"  # Optional
}

Response (201):
{
    "message": "Transfer successful",
    "reference_id": "TXN202604040328359MBGZICJ",
    "from_transaction": { ...debit transaction... },
    "to_transaction": { ...credit transaction... },
    "status": "completed"
}
```

### Get Transactions
```
GET /api/transactions?account_id=1&type=deposit&start_date=2024-04-01&page=1&per_page=20
Authorization: Bearer <access_token>

Response (200):
{
    "account_id": 1,
    "account_number": "982677845009883129",
    "total": 50,
    "pages": 3,
    "current_page": 1,
    "transactions": [...]
}
```

**Query Parameters**:
- `account_id`: Filter by specific account (optional)
- `type`: Filter by type (deposit, withdrawal, transfer)
- `start_date`: Filter from date (YYYY-MM-DD)
- `end_date`: Filter until date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)

### Get Single Transaction
```
GET /api/transactions/<transaction_id>
Authorization: Bearer <access_token>

Response (200):
{ ...transaction data... }
```

### Get Transaction Summary
```
GET /api/transactions/summary/<account_id>?days=30
Authorization: Bearer <access_token>

Response (200):
{
    "account_id": 1,
    "period_days": 30,
    "transaction_count": 15,
    "deposits": { "count": 5, "total": 25000 },
    "withdrawals": { "count": 8, "total": 12000 },
    "transfers_incoming": { "count": 2, "total": 5000 },
    "transfers_outgoing": { "count": 3, "total": 8000 },
    "net_change": 10000,
    "current_balance": 45000
}
```

---

## Authorization Rules

| Operation | Customer | Staff | Manager | Admin |
|-----------|----------|-------|---------|-------|
| Deposit to own account | ✓ | ✓ | ✓ | ✓ |
| Deposit to other account | ✗ | ✓ | ✓ | ✓ |
| Withdraw from own account | ✓ | ✓ | ✓ | ✓ |
| Withdraw from other account | ✗ | ✓ | ✓ | ✓ |
| Transfer from own account | ✓ | ✓ | ✓ | ✓ |
| Transfer from other account | ✗ | ✓ | ✓ | ✓ |
| View own transactions | ✓ | ✓ | ✓ | ✓ |
| View other transactions | ✗ | ✓ | ✓ | ✓ |

---

## Database Model

### Transaction Table
```python
id                  Integer (PK)
reference_id        String(50) indexed
transaction_type    String(50) - deposit, withdrawal, transfer, etc.
status              String(20) - success, pending, failed, cancelled
amount              Numeric(15,2)
description         String(255)
account_id          Integer (FK → Account)
recipient_account_id Integer (FK → Account) - for transfers
user_id             Integer (FK → User)
created_at          DateTime indexed
updated_at          DateTime
```

---

## Key Features

### Atomic Transfers
- Both debit and credit must succeed
- If either fails, both are rolled back
- No partial transfers possible
- SQLAlchemy handles transaction rollback

### Reference ID Linking
- Deposits/Withdrawals: Unique reference per transaction
- Transfers: Both debit and credit share same reference_id
- Allows tracing related transactions

### Pagination
- Default: 20 items per page
- Returns: total, pages, current_page
- Transactions sorted by created_at (DESC)

### Filtering
- By transaction type
- By date range (from/to)
- By account
- All filters combine

### Summary Statistics
- Configurable period (default: 30 days)
- Grouped by transaction type
- Shows incoming/outgoing transfers separately
- Calculates net change and current balance

---

## Error Handling

### Validation Errors (400)
- Amount must be > 0
- Account does not exist
- Cannot transfer to same account
- Invalid transaction type

### Insufficient Balance (400)
- Withdrawal amount > balance
- Transfer amount > source balance
- Specific error message with available balance

### Authorization Errors (403)
- Cannot access other user's account
- Cannot view other user's transactions

### Not Found Errors (404)
- Transaction ID not found
- Account ID not found
- User ID not found

---

## Testing

### Test Coverage (31 tests)
**Deposits (6 tests)**:
- Successful deposit
- Multiple deposits
- Zero/negative amount validation
- Non-existent account validation
- Transaction record creation

**Withdrawals (6 tests)**:
- Successful withdrawal
- Insufficient balance error
- Exact balance withdrawal
- Zero/negative amount validation
- Non-existent account validation

**Transfers (10 tests)**:
- Successful transfer
- Creates two linked transactions
- Insufficient balance error
- Cannot transfer to same account
- Zero/negative amount validation
- Invalid account validation
- Multiple sequential transfers
- Atomicity (failure doesn't change balances)

**Retrieval (5 tests)**:
- Get single transaction
- Get account transactions
- Filter by type
- Filter by date range
- Pagination

**Integration (2 tests)**:
- Complete account flow
- Simultaneous transfers between accounts

**Summary (1 test)**:
- Transaction statistics

### Run Tests
```bash
cd backend
python -m pytest test_transactions.py -v
```

Result: **31 passed, 0 failed** ✅

---

## Implementation Notes

### Decimal Precision
- All amounts use Decimal type
- Avoids floating-point errors
- Proper rounding for currency

### Transaction Atomicity
- SQLAlchemy session commit
- If exception occurs during transfer, rollback happens automatically
- Both updates happen together

### Reference ID Format
- Format: `TXN{YYYYMMDDHHMMSS}{8-random}`
- Example: `TXN202604040328359MBGZICJ`
- Unique per transaction (except for transfers)

### Balance Updates
- Updated at transaction creation
- No separate update query needed
- Account.updated_at also updated

---

## Next Steps: STEP 5 (Beneficiary System)

Will implement:
- Add beneficiary (with validation)
- Approve beneficiary (manual approval)
- List beneficiaries
- Delete beneficiary
- Transfer only to approved beneficiaries
- Pending approval tracking
