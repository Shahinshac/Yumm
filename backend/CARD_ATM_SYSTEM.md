# STEP 6: Card & ATM System

## Overview

Complete debit card management system with ATM simulation for withdrawals, balance checks, and mini statements. Includes PIN-based authentication, card blocking, and secure transaction recording.

---

## Core Concept

The card & ATM system implements:
1. **Card Lifecycle**: Generate → Set PIN → Use for ATM → Block if needed
2. **ATM Operations**: Login with card + PIN → Access account functions
3. **Security**: PIN hashing (bcrypt), card status validation, blocked card detection
4. **Transactions**: All ATM operations create transaction records for audit trail

---

## CardService Methods

### 1. Generate Card
```python
CardService.generate_card(account_id: int) → Card
```

**Functionality**:
- Create new debit card with auto-generated card number (16 digits)
- Generate expiry date (MM/YY format, 5 years in future)
- Set default PIN as "0000" (user must change immediately)
- Activate card and set account/user linkage

**Validations**:
- Account exists

**Returns**: Card object with is_active=True, is_blocked=False

**Example**:
```python
card = CardService.generate_card(account_id=1)
# Returns: Card with card_number="4532825795063790", expiry_date="04/29", PIN="0000"
```

---

### 2. Get Card
```python
CardService.get_card(card_id: int) → Card
```

**Returns**: Card object by ID
**Raises**: ResourceNotFoundError if not found

---

### 3. Get Card by Number
```python
CardService.get_card_by_number(card_number: str) → Card
```

**Returns**: Card object by card number (for ATM lookup)
**Raises**: ResourceNotFoundError if not found

---

### 4. Get Account Cards
```python
CardService.get_account_cards(account_id: int) → list
```

**Returns**: List of all cards for account (sorted by creation, newest first)
**Raises**: ResourceNotFoundError if account not found

---

### 5. Set or Change PIN
```python
CardService.set_pin(card_id: int, pin: str) → Card
```

**Functionality**:
- Change card PIN
- Validates PIN format (exactly 4 digits)
- Hashes PIN with bcrypt before storage
- Cannot view stored PIN hash (irreversible)

**Validations**:
- Card exists
- PIN is exactly 4 digits

**Returns**: Updated card object

**Example**:
```python
updated_card = CardService.set_pin(card_id=1, pin="1234")
# Now card requires PIN "1234" for ATM login
```

---

### 6. Verify PIN (Internal)
```python
CardService.verify_pin(card_number: str, pin: str) → Card
```

**Functionality**:
- Verify PIN matches hash (used by ATM login)
- Check card is active
- Check card is not blocked
- Prevents fraud by verifying both conditions

**Returns**: Card object if PIN correct

**Raises**:
- AuthenticationError if PIN incorrect
- AuthenticationError if card blocked
- AuthenticationError if card inactive
- ResourceNotFoundError if card not found

---

### 7. Block Card
```python
CardService.block_card(card_id: int) → Card
```

**Functionality**:
- Disable card transactions
- Prevents ATM login
- Used for lost/stolen cards

**Returns**: Updated card with is_blocked=True

**Raises**: ValidationError if already blocked

---

### 8. Unblock Card
```python
CardService.unblock_card(card_id: int) → Card
```

**Functionality**:
- Re-enable card transactions
- Restore ATM access

**Returns**: Updated card with is_blocked=False

**Raises**: ValidationError if not blocked

---

## ATMService Methods

### 1. ATM Login
```python
ATMService.atm_login(card_number: str, pin: str) → dict
```

**Functionality**:
- Authenticate with card and PIN
- Return account information for withdrawal/balance operations
- Mask sensitive card number

**Returns**:
```python
{
    "card_id": 1,
    "account_number": "982677845009883129",
    "account_id": 1,
    "card_number": "****3790",  # Masked - last 4 digits only
    "balance": 10000.0
}
```

**Raises**:
- AuthenticationError if PIN incorrect
- AuthenticationError if card blocked/inactive
- ResourceNotFoundError if card not found

**Example**:
```python
result = ATMService.atm_login(card_number="4532825795063790", pin="1234")
# Returns account info - use for subsequent ATM operations
```

---

### 2. Check Balance
```python
ATMService.atm_check_balance(card_id: int) → dict
```

**Functionality**:
- Get current account balance via ATM
- Return account summary

**Returns**:
```python
{
    "account_number": "982677845009883129",
    "balance": 10000.0,
    "currency": "INR"
}
```

**Raises**: ResourceNotFoundError if card not found

---

### 3. ATM Withdrawal
```python
ATMService.atm_withdraw(card_id: int, amount: float) → dict
```

**Functionality**:
- Withdraw money from account
- Create transaction record with ATM reference
- Update account balance (via atomic transaction)
- Track withdrawal with card last 4 digits in description

**Validations**:
- Amount > 0
- Amount ≤ 100,000 (daily limit)
- Sufficient balance

**Returns**:
```python
{
    "message": "Withdrawal successful",
    "transaction_id": 1,
    "reference_id": "TXN2024040403405195W27M8R",
    "amount": 1000.0,
    "new_balance": 9000.0,
    "timestamp": "2024-04-04T10:30:00"
}
```

**Raises**:
- ValidationError if amount invalid
- InsufficientBalanceError if insufficient balance
- ResourceNotFoundError if card not found

---

### 4. Mini Statement
```python
ATMService.atm_mini_statement(card_id: int, num_transactions: int = 5) → dict
```

**Functionality**:
- Get last N account transactions
- Show transaction history on ATM screen

**Returns**:
```python
{
    "account_number": "982677845009883129",
    "account_type": "savings",
    "current_balance": 9000.0,
    "statement_date": "2024-04-04T10:35:00",
    "transactions": [
        {
            "id": 1,
            "reference_id": "TXN2024040403405195W27M8R",
            "transaction_type": "withdrawal",
            "amount": 1000.0,
            "description": "ATM Withdrawal - 3790",
            "created_at": "2024-04-04T10:30:00"
        },
        ...
    ],
    "transaction_count": 1
}
```

**Parameters**:
- `num_transactions`: Number of recent txns to include (default 5)

**Raises**: ResourceNotFoundError if card not found

---

## API Endpoints

### Card Management

#### Generate Card
```
POST /api/cards
Authorization: Bearer <access_token>  (staff/admin only)

{
    "account_id": 1
}

Response (201):
{
    "message": "Card generated successfully. Please set your PIN.",
    "card": {
        "id": 1,
        "card_number": "****3790",
        "card_type": "debit",
        "expiry_date": "04/29",
        "is_active": true,
        "is_blocked": false,
        "account_id": 1,
        "created_at": "2024-04-04T10:00:00"
    },
    "note": "Default PIN is 0000. Please change it immediately."
}
```

#### List Cards
```
GET /api/cards?account_id=1
Authorization: Bearer <access_token>

Response (200):
{
    "account_id": 1,
    "count": 2,
    "cards": [
        { ...card data... },
        { ...card data... }
    ]
}
```

#### Get Card Details
```
GET /api/cards/<card_id>
Authorization: Bearer <access_token>

Response (200):
{ ...card data with masked number... }
```

#### Set PIN
```
POST /api/cards/<card_id>/set-pin
Authorization: Bearer <access_token>

{
    "pin": "1234"
}

Response (200):
{
    "message": "PIN set successfully",
    "card": { ...updated card data... }
}
```

#### Block Card
```
POST /api/cards/<card_id>/block
Authorization: Bearer <access_token>  (staff+ only)

Response (200):
{
    "message": "Card blocked successfully",
    "card": { ...updated card with is_blocked=true... }
}
```

#### Unblock Card
```
POST /api/cards/<card_id>/unblock
Authorization: Bearer <access_token>  (staff+ only)

Response (200):
{
    "message": "Card unblocked successfully",
    "card": { ...updated card with is_blocked=false... }
}
```

---

### ATM Operations

#### ATM Login
```
POST /api/atm/login
No authorization required (simulates ATM machine)

{
    "card_number": "4532825795063790",
    "pin": "1234"
}

Response (200):
{
    "message": "ATM login successful",
    "session": {
        "card_id": 1,
        "account_number": "982677845009883129",
        "account_id": 1,
        "card_number": "****3790",
        "balance": 10000.0
    }
}
```

#### Check Balance
```
GET /api/atm/balance/<card_id>

Response (200):
{
    "account_number": "982677845009883129",
    "balance": 10000.0,
    "currency": "INR"
}
```

#### Withdraw
```
POST /api/atm/withdraw/<card_id>

{
    "amount": 5000
}

Response (200):
{
    "message": "Withdrawal successful",
    "transaction_id": 1,
    "reference_id": "TXN2024040403405195W27M8R",
    "amount": 5000.0,
    "new_balance": 5000.0,
    "timestamp": "2024-04-04T10:30:00"
}
```

#### Mini Statement
```
GET /api/atm/mini-statement/<card_id>?num_transactions=5

Response (200):
{
    "account_number": "982677845009883129",
    "account_type": "savings",
    "current_balance": 5000.0,
    "statement_date": "2024-04-04T10:35:00",
    "transactions": [ ... ],
    "transaction_count": 1
}
```

---

## Authorization Rules

| Operation | Customer | Staff | Manager | Admin |
|-----------|----------|-------|---------|-------|
| Generate card (own account) | ✗ | ✓ | ✓ | ✓ |
| Generate card (other account) | ✗ | ✓ | ✓ | ✓ |
| List cards (own) | ✓ | ✓ | ✓ | ✓ |
| List cards (other) | ✗ | ✓ | ✓ | ✓ |
| Get card details (own) | ✓ | ✓ | ✓ | ✓ |
| Get card details (other) | ✗ | ✓ | ✓ | ✓ |
| Set PIN (own) | ✓ | ✓ | ✓ | ✓ |
| Set PIN (other) | ✗ | ✓ | ✓ | ✓ |
| Block card | ✗ | ✓ | ✓ | ✓ |
| Unblock card | ✗ | ✓ | ✓ | ✓ |
| ATM login | ✓ (public) | ✓ (public) | ✓ (public) | ✓ (public) |
| ATM operations | ✓ (via login) | ✓ (via login) | ✓ (via login) | ✓ (via login) |

---

## Database Model

### Card Table
```python
id                  Integer (PK)
card_number         String(20) unique, indexed
card_type           String(20) default="debit"
pin_hash            String(255) (bcrypt hashed, not reversible)
expiry_date         String(5) MM/YY format
cvv_hash            String(255) nullable (optional)
is_active           Boolean default=True
is_blocked          Boolean default=False
account_id          Integer (FK → Account) indexed
user_id             Integer (FK → User) indexed
created_at          DateTime indexed
updated_at          DateTime
```

---

## Card Lifecycle

### State Diagram
```
┌──────────────────┐
│  Card Generated  │
│  (Default PIN)   │
└────────┬─────────┘
         │ (is_active=True, is_blocked=False)
         ↓
┌──────────────────┐
│   User Sets PIN  │
│  (New 4 digits)  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   ATM Ready      │
│  (Can login/use) │
└────────┬─────────┘
         │ (user lost card)
         ↓
┌──────────────────┐
│  Card Blocked    │
│ (No ATM access)  │
└────────┬─────────┘
         │ (customer calls)
         ↓
┌──────────────────┐
│  Card Unblocked  │
│  (Reactivated)   │
└──────────────────┘
```

---

## PIN Security

### Storage
- PIN never stored in plain text
- Always hashed with bcrypt (12 rounds, same as password)
- Salt is unique per PIN, making rainbow table attacks ineffective
- Even database compromise cannot reveal PINs

### Comparison
```python
# Hashing (set PIN)
pin_hash = PINSecurity.hash_pin("1234")
# Stored: $2b$12$H...(60 chars)...(irreversible)

# Verification (ATM login)
is_valid = PINSecurity.verify_pin("1234", stored_hash)
# compares using bcrypt, prevents timing attacks
```

### Brute Force Protection
- No per-attempt delays (intentional - ATM simulation)
- In production: Add rate limiting + lockout after N failures
- Transactions logged for audit trail

---

## Integration with Transaction System

ATM withdrawals create proper transaction records:

```python
# ATM withdrawal path
ATMService.atm_withdraw(card_id, amount)
    ↓
TransactionService.withdraw(account_id, amount, description)
    ↓
Create Transaction(
    type=WITHDRAWAL,
    status=SUCCESS,
    amount=amount,
    account_id=account_id,
    description="ATM Withdrawal - 3790"
)
    ↓
Update Account balance (atomic)
```

**Key**: Each ATM operation becomes auditable transaction in system

---

## Card Number Generation

### Format
```
4532 + 12 random digits = 16 total
        ↑ Visa prefix

Example: 4532 8257 9506 3790
```

### Validation
- Must be 16 digits
- Cannot have duplicates (checked in DB before insert)
- Luhn algorithm NOT implemented (simulation only)

---

## Expiry Date Generation

### Format
```
MM/YY (5 years in future)

Today: 2024-04-04
Generated: 04/29 (April 2029)
```

---

## Error Handling

### 400 Bad Request
- Missing required fields
- Invalid amount (zero, negative, over limit)
- Invalid PIN format (not 4 digits)
- Insufficient balance

### 401 Unauthorized
- Invalid PIN for ATM login
- Card not active
- Card blocked

### 404 Not Found
- Card doesn't exist
- Account doesn't exist
- Card number not found

### 409 Conflict
- Already blocked (when blocking again)
- Not blocked (when unblocking non-blocked card)

### 403 Forbidden
- Viewing/managing other user's cards (not staff+)
- Setting PIN for other user's card (not staff+)

---

## Testing

### Test Coverage (46 tests)

**Card Generation (5 tests)**:
- Successful generation
- Invalid account
- Unique card numbers
- Multiple cards same account
- Default PIN is 0000

**PIN Management (8 tests)**:
- Set PIN successfully
- Old PIN invalid after change
- Invalid PIN formats
- Card not found
- Verify PIN correct
- Verify PIN incorrect
- Blocked card verification fails
- Inactive card verification fails

**ATM Login (4 tests)**:
- Successful login
- Invalid PIN
- Invalid card
- Default PIN login

**ATM Balance (2 tests)**:
- Check balance success
- Invalid card

**ATM Withdrawal (6 tests)**:
- Successful withdrawal
- Insufficient balance
- Invalid amounts (zero, negative)
- Exceeds daily limit
- Creates transaction record
- Invalid card

**ATM Mini Statement (4 tests)**:
- Successful statement
- Transaction limit respected
- Empty statement
- Invalid card

**Card Block/Unblock (6 tests)**:
- Block successfully
- Already blocked error
- Unblock successfully
- Not blocked error
- ATM login with blocked card fails
- ATM operations with blocked card

**Card Retrieval (6 tests)**:
- Get by ID
- Not found
- Get by number
- Number not found
- List all
- Invalid account

**Card to_dict (3 tests)**:
- Masks card number
- Includes sensitive when requested
- All required fields present

**Integration (2 tests)**:
- Complete workflow (generate → PIN → transactions → block → unblock)
- Multiple cards independence

---

## Key Features

### Security
- PIN hashing with bcrypt (irreversible)
- Card blocking prevents unauthorized use
- Status validation (active/blocked/etc.)
- Transaction audit trail

### Convenience
- Auto-generated unique card numbers
- Quick PIN setup
- Easy balance checking
- Mini statement for transaction history

### Reliability
- Card and account linked
- Transactions atomic (all-or-nothing)
- Masked card numbers in responses
- Proper error messages

### Audit Trail
- All withdrawals recorded
- Transaction reference ID for tracking
- User ID linked to card
- Timestamps on all operations

---

## Production Considerations

### What to Add
1. **Rate Limiting**: Lock card after 3 failed PIN attempts
2. **Daily Limits**: Enforced withdrawal limit (currently warning only)
3. **Expiry Validation**: Block transactions on expired cards
4. **CVV**: Store and validate CVV for e-commerce
5. **Transaction Fees**: Deduct ATM fees from withdrawal
6. **Text Alerts**: SMS/email on card usage
7. **Geolocation**: Fraud detection based on location
8. **Card Replacement**: Lost/damaged card reissue workflow

### Configuration
```python
# In production config
CARD_DAILY_LIMIT = 100000  # Maximum withdrawal per day
ATM_PIN_ATTEMPTS = 3       # Max failed attempts before lock
ATM_LOCKOUT_MINUTES = 15   # How long card locked
ATM_TRANSACTION_FEE = 20   # Deduct from withdrawal
```

---

## Next Steps: STEP 7 (Loan Management)

Will implement:
- Loan application and approval workflow
- Loan calculation and EMI computation
- Payment tracking and status management
- Interest calculation and penalties

