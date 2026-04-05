# Bill Payment & Interest System - API Quick Reference

## Bill Payment Endpoints

### 1. Pay Mobile Bill
**Endpoint:** `POST /api/bills/mobile`
**Auth:** Required (JWT)
**Role:** Any authenticated user (own accounts only)

**Request Body:**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "amount": 500.00,
  "phone_number": "03001234567",
  "description": "Monthly recharge"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Bill payment successful",
  "bill": {
    "id": "...",
    "bill_id": "BIL-...",
    "bill_type": "mobile_recharge",
    "amount": 500.00,
    "recipient_identifier": "03001234567",
    "status": "success"
  },
  "transaction": {
    "id": "...",
    "reference_id": "TXN-...",
    "transaction_type": "bill_payment",
    "amount": 500.00,
    "status": "success"
  },
  "account_balance": 9500.00
}
```

**Errors:**
- 400: account_id/amount/phone_number missing
- 403: Account doesn't belong to current user
- 403: Insufficient balance

---

### 2. Pay Electricity Bill
**Endpoint:** `POST /api/bills/electricity`
**Auth:** Required (JWT)
**Role:** Any authenticated user (own accounts only)

**Request Body:**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "amount": 2500.00,
  "account_number": "123456789",
  "consumer_name": "John Doe",
  "description": "Monthly electricity"
}
```

**Required Fields:** account_id, amount, account_number
**Optional Fields:** consumer_name, description

---

### 3. Pay Internet Bill
**Endpoint:** `POST /api/bills/internet`
**Auth:** Required (JWT)
**Role:** Any authenticated user (own accounts only)

**Request Body:**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "amount": 1500.00,
  "account_number": "ACCT-12345",
  "isp_name": "FastNet ISP",
  "description": "Monthly internet"
}
```

**Required Fields:** account_id, amount, account_number
**Optional Fields:** isp_name, description

---

### 4. Get Bill Payment History
**Endpoint:** `GET /api/bills/history`
**Auth:** Required (JWT)
**Role:** Any authenticated user

**Query Parameters:**
- `account_id` (optional): Filter by specific account
- `bill_type` (optional): Filter by type (mobile_recharge, electricity, internet)
- `page` (optional, default=1): Page number
- `per_page` (optional, default=20): Items per page

**Examples:**
```
GET /api/bills/history
GET /api/bills/history?account_id=507f1f77bcf86cd799439011
GET /api/bills/history?bill_type=mobile_recharge&page=1&per_page=10
```

**Response (200):**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "account_number": "ACC001234567",
  "bill_type_filter": null,
  "total": 25,
  "pages": 2,
  "current_page": 1,
  "bill_payments": [
    {
      "id": "...",
      "payment_id": "PAY-...",
      "bill_type": "mobile_recharge",
      "amount": 500.00,
      "recipient_identifier": "03001234567",
      "status": "success",
      "created_at": "2024-04-05T10:30:00"
    }
  ]
}
```

---

### 5. Get Bill Statistics
**Endpoint:** `GET /api/bills/statistics`
**Auth:** Required (JWT)
**Role:** Any authenticated user (own accounts only)

**Query Parameters:**
- `account_id` (required): Account to analyze
- `bill_type` (optional): Filter by type

**Examples:**
```
GET /api/bills/statistics?account_id=507f1f77bcf86cd799439011
GET /api/bills/statistics?account_id=507f1f77bcf86cd799439011&bill_type=mobile_recharge
```

**Response (200):**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "account_number": "ACC001234567",
  "total_payments": 25,
  "total_paid": 12500.00,
  "average_payment": 500.00,
  "by_type": {
    "mobile_recharge": {
      "count": 10,
      "total": 5000.00,
      "average": 500.00
    },
    "electricity": {
      "count": 8,
      "total": 20000.00,
      "average": 2500.00
    },
    "internet": {
      "count": 7,
      "total": 10500.00,
      "average": 1500.00
    }
  }
}
```

---

## Interest System Endpoints

### 1. Calculate Interest
**Endpoint:** `GET /api/accounts/<account_id>/interest/calculate`
**Auth:** Required (JWT)
**Role:** Account owner or Admin/Manager/Staff

**Example:**
```
GET /api/accounts/507f1f77bcf86cd799439011/interest/calculate
```

**Response (200) - Savings Account:**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "account_number": "ACC001234567",
  "account_type": "savings",
  "balance": 10000.00,
  "annual_rate": 8.0,
  "monthly_rate": 0.6667,
  "interest_earned": 66.67
}
```

**Response (200) - Current Account:**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "account_number": "ACC001234567",
  "account_type": "current",
  "balance": 50000.00,
  "annual_rate": 0.0,
  "monthly_rate": 0.0,
  "interest_earned": 0.0,
  "status": "no_interest"
}
```

**Interest Rates:**
- Savings: 8% annual (0.67% monthly)
- Salary: 4% annual (0.33% monthly)
- Current: 0% (no interest)

---

### 2. Accrue Interest
**Endpoint:** `POST /api/accounts/<account_id>/interest/accrue`
**Auth:** Required (JWT)
**Role:** Admin/Manager/Staff only

**Example:**
```
POST /api/accounts/507f1f77bcf86cd799439011/interest/accrue
```

**Response (200):**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "account_number": "ACC001234567",
  "status": "success",
  "message": "Interest accrued successfully",
  "interest_amount": 66.67,
  "new_balance": 10066.67,
  "transaction": {
    "id": "...",
    "reference_id": "TXN-...",
    "transaction_type": "interest_credit",
    "amount": 66.67,
    "description": "Monthly interest (0.6667%) credited on ACC001234567",
    "status": "success",
    "created_at": "2024-04-05T10:45:00"
  }
}
```

**Response (200) - No Interest Account:**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "status": "no_interest",
  "message": "No interest for current accounts"
}
```

---

### 3. Interest Statistics
**Endpoint:** `GET /api/accounts/<account_id>/interest/statistics`
**Auth:** Required (JWT)
**Role:** Account owner or Admin/Manager/Staff

**Example:**
```
GET /api/accounts/507f1f77bcf86cd799439011/interest/statistics
```

**Response (200):**
```json
{
  "account_id": "507f1f77bcf86cd799439011",
  "account_number": "ACC001234567",
  "account_type": "savings",
  "current_balance": 10066.67,
  "annual_interest_rate": 8.0,
  "monthly_interest_rate": 0.6667,
  "estimated_next_interest": 67.11,
  "next_interest_date": "2024-05-01T00:00:00",
  "total_interest_credited": 200.50,
  "interest_transaction_count": 3,
  "last_interest_date": "2024-04-01T00:00:00"
}
```

---

### 4. Process Interest for User
**Endpoint:** `POST /api/accounts/interest/process-user`
**Auth:** Required (JWT)
**Role:** Admin/Manager only

**Request Body:**
```json
{
  "user_id": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "user_id": "507f1f77bcf86cd799439012",
  "total_accounts": 3,
  "accounts_processed": 2,
  "total_interest": 150.00,
  "account_details": [
    {
      "account_id": "507f1f77bcf86cd799439011",
      "status": "success",
      "message": "Interest accrued successfully",
      "interest_amount": 66.67,
      "new_balance": 10066.67
    },
    {
      "account_id": "507f1f77bcf86cd799439013",
      "status": "success",
      "message": "Interest accrued successfully",
      "interest_amount": 83.33,
      "new_balance": 20083.33
    },
    {
      "account_id": "507f1f77bcf86cd799439014",
      "status": "no_interest",
      "message": "No interest for current accounts"
    }
  ]
}
```

---

### 5. Process Interest for All Users (Batch)
**Endpoint:** `POST /api/accounts/interest/process-all`
**Auth:** Required (JWT)
**Role:** Admin only

**Example:**
```
POST /api/accounts/interest/process-all
```

**Response (200):**
```json
{
  "timestamp": "2024-04-05T10:50:00",
  "total_users": 1000,
  "users_processed": 892,
  "total_interest_accrued": 125000.50,
  "user_results": [
    {
      "user_id": "507f1f77bcf86cd799439012",
      "total_accounts": 3,
      "accounts_processed": 2,
      "total_interest": 150.00,
      "account_details": [...]
    }
  ]
}
```

---

## Testing with cURL

### Test Bill Payment
```bash
# Get account details first
curl -X GET http://localhost:5000/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Pay mobile bill
curl -X POST http://localhost:5000/api/bills/mobile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "YOUR_ACCOUNT_ID",
    "amount": 500,
    "phone_number": "03001234567"
  }'
```

### Test Interest
```bash
# Calculate interest
curl -X GET http://localhost:5000/api/accounts/YOUR_ACCOUNT_ID/interest/calculate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get interest statistics
curl -X GET http://localhost:5000/api/accounts/YOUR_ACCOUNT_ID/interest/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Accrue interest (admin only)
curl -X POST http://localhost:5000/api/accounts/YOUR_ACCOUNT_ID/interest/accrue \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "error": "account_id is required"
}
```

### 403 - Unauthorized
```json
{
  "error": "Unauthorized - account does not belong to current user"
}
```

### 403 - Insufficient Balance
```json
{
  "error": "Insufficient balance. Available: 1000, Required: 1500"
}
```

### 404 - Not Found
```json
{
  "error": "Account with ID ... not found"
}
```

### 500 - Internal Error
```json
{
  "error": "Bill payment failed: ..."
}
```

---

## Notes

- All currency amounts use Decimal precision internally (no floating point errors)
- All timestamps are in UTC ISO 8601 format
- Interest is calculated on the 1st of each month
- Bill payments are immediately deducted from account (not pending)
- All operations are atomic (all succeed or all fail)
- User authorization is strictly enforced (can't access others' accounts)
