# STEP 5: Beneficiary System

## Overview
Complete beneficiary management system for approving transfer recipients and maintaining a whitelist of beneficiaries.

---

## Core Concept

The beneficiary system implements a **two-tier approval model**:
1. **Customer adds beneficiary** → Pending approval
2. **Staff/Admin approves** → Ready for transfers

This prevents accidental transfers to wrong accounts and adds a security layer.

---

## Beneficiary Service Methods

### 1. Add Beneficiary
```python
BeneficiaryService.add_beneficiary(
    account_id: int,
    beneficiary_account_number: str,
    beneficiary_name: str
) → Beneficiary
```

**Functionality**:
- Create a new beneficiary entry
- Initially marked as unapproved
- Cannot add own account as beneficiary

**Validations**:
- Account exists
- Account number format valid
- Name format valid (2-100 chars, letters only)
- Not duplicate entry
- Not own account

**Returns**: Beneficiary object in pending state

**Example**:
```python
ben = BeneficiaryService.add_beneficiary(
    account_id=1,
    beneficiary_account_number="982677845009883129",
    beneficiary_name="John Doe"
)
# Returns:Beneficiary with is_approved=False
```

---

### 2. Get Beneficiary
```python
BeneficiaryService.get_beneficiary(beneficiary_id: int) → Beneficiary
```

**Returns**: Beneficiary object by ID
**Raises**: ResourceNotFoundError if not found

---

### 3. List Account Beneficiaries
```python
BeneficiaryService.get_account_beneficiaries(
    account_id: int,
    approved_only: bool = False
) → list
```

**Parameters**:
- `account_id`: Account to get beneficiaries for
- `approved_only`: Return only approved (default: all)

**Returns**: List of beneficiaries sorted by creation (newest first)

**Example**:
```python
# All beneficiaries (approved + pending)
all_ben = BeneficiaryService.get_account_beneficiaries(account_id=1)

# Only approved
approved = BeneficiaryService.get_account_beneficiaries(
    account_id=1,
    approved_only=True
)
```

---

### 4. Approve Beneficiary
```python
BeneficiaryService.approve_beneficiary(
    beneficiary_id: int,
    approved_by_user_id: int
) → Beneficiary
```

**Functionality**:
- Mark beneficiary as approved
- Record who approved and when
- Only staff/admin can approve

**Sets**:
- `is_approved` = True
- `approved_by` = User ID of approver
- `approved_at` = Current timestamp

**Returns**: Updated beneficiary

**Raises**: ValidationError if already approved

---

### 5. Reject Beneficiary
```python
BeneficiaryService.reject_beneficiary(beneficiary_id: int) → Beneficiary
```

**Functionality**:
- Remove pending beneficiary from queue
- Cannot transfer to rejected beneficiary

**Returns**: Deleted beneficiary object

---

### 6. Delete Beneficiary
```python
BeneficiaryService.delete_beneficiary(beneficiary_id: int) → dict
```

**Functionality**:
- Permanently delete beneficiary
- Transfers to deleted account will fail

**Returns**: Confirmation message

---

### 7. Check If Approved (Boolean)
```python
BeneficiaryService.is_approved(
    account_id: int,
    beneficiary_account_number: str
) → bool
```

**Returns**: True if beneficiary exists and is approved, False otherwise

---

### 8. Check If Approved (Error)
```python
BeneficiaryService.check_if_approved(
    account_id: int,
    beneficiary_account_number: str
) → None
```

**Functionality**:
- Validates beneficiary is approved
- Used by transfer system to block unapproved transfers

**Raises**:
- ValidationError if not found
- ValidationError if not approved

---

### 9. Get Pending Beneficiaries
```python
BeneficiaryService.get_pending_beneficiaries() → list
```

**Returns**: All unapproved beneficiaries (admin queue)
**Access**: Staff/Manager/Admin only

---

### 10. Get Statistics
```python
BeneficiaryService.get_beneficiary_statistics() → dict
```

**Returns**:
```python
{
    "total_beneficiaries": 50,
    "approved": 40,
    "pending": 10,
    "approval_rate": 80.0
}
```

---

## API Endpoints

### Add Beneficiary
```
POST /api/beneficiaries
Authorization: Bearer <access_token>

{
    "account_id": 1,
    "beneficiary_account_number": "982677845009883129",
    "beneficiary_name": "John Doe"
}

Response (201):
{
    "message": "Beneficiary added successfully (pending approval)",
    "beneficiary": {
        "id": 1,
        "account_id": 1,
        "beneficiary_account_number": "982677845009883129",
        "beneficiary_name": "John Doe",
        "is_approved": false,
        "approved_at": null,
        "created_at": "2024-04-04T10:30:00"
    }
}
```

### List Beneficiaries
```
GET /api/beneficiaries?account_id=1&approved_only=false
Authorization: Bearer <access_token>

Response (200):
{
    "account_id": 1,
    "count": 5,
    "approved_only": false,
    "beneficiaries": [...]
}
```

### Get Single Beneficiary
```
GET /api/beneficiaries/<id>
Authorization: Bearer <access_token>

Response (200):
{ ...beneficiary data... }
```

### Approve Beneficiary
```
POST /api/beneficiaries/<id>/approve
Authorization: Bearer <access_token>

Response (200):
{
    "message": "Beneficiary approved successfully",
    "beneficiary": { ...updated... }
}
```

### Reject Beneficiary
```
POST /api/beneficiaries/<id>/reject
Authorization: Bearer <access_token>

Response (200):
{
    "message": "Beneficiary <account_number> rejected"
}
```

### Delete Beneficiary
```
DELETE /api/beneficiaries/<id>
Authorization: Bearer <access_token>

Response (200):
{
    "message": "Beneficiary <number> deleted"
}
```

### Get Pending (Approval Queue)
```
GET /api/beneficiaries/pending
Authorization: Bearer <access_token>  (staff+ only)

Response (200):
{
    "count": 10,
    "beneficiaries": [...]
}
```

### Get Statistics
```
GET /api/beneficiaries/statistics
Authorization: Bearer <access_token>  (staff+ only)

Response (200):
{
    "total_beneficiaries": 50,
    "approved": 40,
    "pending": 10,
    "approval_rate": 80.0
}
```

---

## Authorization Rules

| Operation | Customer | Staff | Manager | Admin |
|-----------|----------|-------|---------|-------|
| Add beneficiary (own) | ✓ | ✓ | ✓ | ✓ |
| Add beneficiary (other) | ✗ | ✓ | ✓ | ✓ |
| List beneficiaries (own) | ✓ | ✓ | ✓ | ✓ |
| List beneficiaries (other) | ✗ | ✓ | ✓ | ✓ |
| View beneficiary (own) | ✓ | ✓ | ✓ | ✓ |
| View beneficiary (other) | ✗ | ✓ | ✓ | ✓ |
| Approve beneficiary | ✗ | ✓ | ✓ | ✓ |
| Reject beneficiary | ✗ | ✓ | ✓ | ✓ |
| Delete beneficiary (own) | ✓ | ✓ | ✓ | ✓ |
| Delete beneficiary (other) | ✗ | ✓ | ✓ | ✓ |
| View pending queue | ✗ | ✓ | ✓ | ✓ |
| View statistics | ✗ | ✓ | ✓ | ✓ |

---

## Database Model

### Beneficiary Table
```python
id                      Integer (PK)
account_id              Integer (FK → Account) - Account adding beneficiary
beneficiary_account_number String(20) indexed
beneficiary_name        String(120)
beneficiary_account_id  Integer (FK → Account) nullable
is_approved             Boolean default=False
approved_by             Integer (FK → User) nullable
approved_at             DateTime nullable
created_at              DateTime indexed
updated_at              DateTime
```

---

## Approval Workflow

### State Diagram
```
┌─────────────────┐
│   Beneficiary   │
│   Added (New)   │
└────────┬────────┘
         │ (is_approved=False)
         ↓
┌─────────────────┐
│    Pending      │
│   Approval      │
└────────┬────────┘
         │ (staff approves)
         ↓
┌─────────────────┐
│   Approved      │
│ (can transfer)  │
└────────┬────────┘
         │ (customer deletes)
         ↓
    Deleted
```

### Timeline Example
```
2024-04-04 10:30:00 → Customer adds beneficiary "John Doe"
  └─ is_approved: false
  └─ approved_by: null
  └─ approved_at: null

2024-04-04 11:15:00 → Staff approves beneficiary
  └─ is_approved: true
  └─ approved_by: 5 (staff user ID)
  └─ approved_at: 2024-04-04T11:15:00

2024-04-05 09:00:00 → Customer can now transfer to "John Doe"
  └─ Transfer succeeds if beneficiary is approved
```

---

## Integration with Transaction System

The transaction service **must** check beneficiary approval before allowing transfers:

```python
# In TransactionService.transfer()
from app.services.beneficiary_service import BeneficiaryService

# Check if beneficiary is approved
BeneficiaryService.check_if_approved(from_account_id, to_account_number)
# Raises ValidationError if not approved
```

### Transfer Validation Flow
```
1. Customer initiates transfer
2. TransactionService.transfer() called
3. Check: to_account exists? ✓
4. Check: balance sufficient? ✓
5. Check: beneficiary approved?
   └─ If NO → Raise ValidationError, transfer blocked
   └─ If YES → Continue with transfer
6. Atomic debit/credit transaction
7. Success
```

---

## Key Features

### Approval Queue
- Staff can view all pending beneficiaries
- Single endpoint to manage approvals
- Approval tracking (who approved, when)

### Validation
- Account number format validation
- Name format validation (no special chars)
- Cannot add own account as beneficiary
- Cannot add duplicates

### Security
- Only staff/manager/admin can approve
- Customers cannot override approval
- Unapproved transfers blocked
- Audit trail (approved_by, approved_at)

### Flexibility
- Approve Individual beneficiaries
- Reject pending beneficiaries
- Delete established beneficiaries
- Filter by approval status

---

## Error Handling

### 400 Bad Request
- Missing required fields
- Invalid account number format
- Invalid name format
- Cannot add own account as beneficiary

### 404 Not Found
- Beneficiary ID doesn't exist
- Account doesn't exist

### 409 Conflict
- Beneficiary already exists for that account

### 403 Forbidden
- Viewing/managing other user's beneficiaries (not staff+)
- Approving without staff role

---

## Testing

### Test Coverage (21 tests)

**Adding (6 tests)**:
- Successful addition
- Invalid account
- Own account validation
- Duplicate prevention
- Account number validation
- Name validation

**Retrieval (5 tests)**:
- Get by ID
- Get not found
- List all
- List approved only
- List invalid account

**Approval (4 tests)**:
- Successful approval
- Cannot approve twice
- is_approved checks
- check_if_approved errors

**Deletion (2 tests)**:
- Delete beneficiary
- Reject pending

**Statistics (2 tests)**:
- Pending list
- Statistics calculation

**Integration (2 tests)**:
- Complete workflow
- to_dict conversion

---

## Next Steps: STEP 6 (Card & ATM Module)

Will implement:
- Debit card creation with auto-generated card numbers
- PIN setting and hashing
- Card activation/deactivation
- ATM simulation (login, withdraw, balance check)
- Mini statement printing
