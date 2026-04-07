# 🧪 Complete Backend Testing Guide - FoodHub

This guide covers all aspects of testing the FoodHub backend, including authentication, registration, approval workflows, and admin functions.

---

## 📋 TABLE OF CONTENTS

1. [Environment Setup](#1-environment-setup)
2. [Testing Tools & Setup](#2-testing-tools--setup)
3. [API Endpoint Tests](#3-api-endpoint-tests)
4. [Workflow Tests](#4-workflow-tests)
5. [Error Handling Tests](#5-error-handling-tests)
6. [Load Testing](#6-load-testing)
7. [Debugging Tips](#7-debugging-tips)

---

## 1. Environment Setup

### 1.1: Backend.env Configuration

Create/update `backend/.env`:

```env
FLASK_ENV=development
MONGODB_URI=mongodb+srv://fooduser:Fv7%40FoodApp123@cluster0.qugxr.mongodb.net/fooddelivery?retryWrites=true&w=majority
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://yummfoodhub.vercel.app
```

### 1.2: Start Backend Locally

```bash
cd backend
pip install -r requirements.txt
python run.py
```

**Expected Output:**
```
 * Serving Flask app 'backend.app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

---

## 2. Testing Tools & Setup

### Option A: Using cURL (Command Line)

All tests below use cURL. No additional setup needed.

### Option B: Using Postman

1. Download **Postman** from postman.com
2. Import collection (see test examples)
3. Set variables:
   - `BASE_URL`: `http://127.0.0.1:5000` (local) or `https://yumm-ym2m.onrender.com` (production)
   - `ADMIN_TOKEN`: Will be set after admin login test
   - `USER_TOKEN`: Will be set after user login test

### Option C: Using Python Scripts

```bash
python test_live_backend.py
python test_backend_comprehensive.py  # Local testing
```

---

## 3. API Endpoint Tests

### 3.1: Health Check ✅

**Purpose:** Verify backend is running

```bash
curl -X GET http://127.0.0.1:5000/api/health
```

**Expected Response (200 OK):**
```json
{
  "status": "healthy",
  "message": "FoodHub Backend is running",
  "database": "connected",
  "users": 5
}
```

### 3.2: Version Check ✅

**Purpose:** Verify backend version and features

```bash
curl -X GET http://127.0.0.1:5000/api/version
```

**Expected Response (200 OK):**
```json
{
  "version": "2.0.0",
  "build": "auth-approval-system-v2",
  "features": [
    "google-signin",
    "restaurant-registration",
    "admin-approval",
    "role-based-access"
  ],
  "status": "production"
}
```

### 3.3: Customer Google Login 🔐

**Purpose:** Authenticate customer via Google

```bash
# Mock token (development)
curl -X POST http://127.0.0.1:5000/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{
    "id_token": "mock_customer_demo"
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "Google login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "mock_customer_demo@gmail.com",
    "role": "customer",
    "is_approved": true,
    "is_active": true,
    "google_id": "mock_customer_demo"
  }
}
```

**Save the access_token for next tests:**
```bash
CUSTOMER_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### 3.4: Get Current User 👤

**Purpose:** Get authenticated user details

```bash
curl -X GET http://127.0.0.1:5000/api/auth/me \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "mock_customer_demo@gmail.com",
  "role": "customer",
  "full_name": "Mock User",
  "is_approved": true,
  "is_active": true,
  "created_at": "2026-04-07T12:00:00"
}
```

### 3.5: Admin Login 🔑

**Purpose:** Login as admin to access approval endpoints

```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin",
    "password": "admin123"
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439020",
    "email": "admin",
    "role": "admin",
    "is_approved": true,
    "is_active": true
  }
}
```

**Save the token:**
```bash
ADMIN_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## 4. Workflow Tests

### Workflow 1: Restaurant Registration & Approval ✅

#### Step 1: Restaurant Registration

```bash
curl -X POST http://127.0.0.1:5000/api/auth/register/restaurant \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Chef",
    "email": "testchef@pizzahub.com",
    "phone": "9876543210",
    "shop_name": "Test Pizza Palace",
    "address": "123 Pizza Street, Downtown"
  }'
```

**Expected Response (201 Created):**
```json
{
  "message": "Registration successful. Awaiting admin approval.",
  "user_id": "507f1f77bcf86cd799439025",
  "next_step": "Contact admin at shaahnpvt7@gmail.com to check approval status"
}
```

**Save the user_id:**
```bash
RESTAURANT_USER_ID="507f1f77bcf86cd799439025"
```

#### Step 2: Try to Login BEFORE Approval ❌

Should FAIL with 403:

```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testchef@pizzahub.com",
    "password": "anypassword"
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "You can login only after admin approval. Please contact admin: shaahnpvt7@gmail.com"
}
```

#### Step 3: Admin Views Pending Users

```bash
curl -X GET http://127.0.0.1:5000/api/admin/pending-users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "count": 1,
  "pending_users": [
    {
      "id": "507f1f77bcf86cd799439025",
      "email": "testchef@pizzahub.com",
      "full_name": "Test Chef",
      "role": "restaurant",
      "is_approved": false,
      "shop_name": "Test Pizza Palace",
      "address": "123 Pizza Street, Downtown",
      "created_at": "2026-04-07T12:30:00"
    }
  ]
}
```

#### Step 4: Admin Approves User

```bash
curl -X POST http://127.0.0.1:5000/api/admin/approve/$RESTAURANT_USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "User approved successfully",
  "user": {
    "id": "507f1f77bcf86cd799439025",
    "email": "testchef@pizzahub.com",
    "role": "restaurant",
    "is_approved": true
  },
  "password": "aBc3dEfGhIjKlMnOpQrSt",
  "note": "Share this password with the user via email or phone. This is shown only once."
}
```

**Save the password:**
```bash
GENERATED_PASSWORD="aBc3dEfGhIjKlMnOpQrSt"
```

#### Step 5: Login AFTER Approval ✅

Should NOW SUCCEED:

```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testchef@pizzahub.com",
    "password": "'$GENERATED_PASSWORD'"
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439025",
    "email": "testchef@pizzahub.com",
    "role": "restaurant",
    "is_approved": true,
    "is_active": true
  }
}
```

### Workflow 2: Delivery Partner Registration & Rejection ✅

#### Step 1: Delivery Registration

```bash
curl -X POST http://127.0.0.1:5000/api/auth/register/delivery \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Runner",
    "email": "testrunner@delivery.com",
    "phone": "9123456789",
    "vehicle_type": "bike"
  }'
```

**Expected Response (201 Created):**
```json
{
  "message": "Registration successful. Awaiting admin approval.",
  "user_id": "507f1f77bcf86cd799439030",
  "next_step": "Contact admin at shaahnpvt7@gmail.com"
}
```

**Save the user_id:**
```bash
DELIVERY_USER_ID="507f1f77bcf86cd799439030"
```

#### Step 2: Admin Rejects User

```bash
curl -X POST http://127.0.0.1:5000/api/admin/reject/$DELIVERY_USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Documents not verified"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "User registration rejected",
  "email": "testrunner@delivery.com"
}
```

#### Step 3: Verify User Is Deleted

```bash
curl -X GET http://127.0.0.1:5000/api/admin/pending-users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

User should no longer appear in the list (count should be 0 or exclude the rejected user).

---

## 5. Error Handling Tests

### Test 5.1: Duplicate Email Registration ❌

```bash
curl -X POST http://127.0.0.1:5000/api/auth/register/restaurant \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Chef",
    "email": "testchef@pizzahub.com",
    "phone": "9876543210",
    "shop_name": "Another Pizza",
    "address": "Another Address"
  }'
```

**Expected Response (409 Conflict):**
```json
{
  "error": "Email already registered"
}
```

### Test 5.2: Invalid Phone Number ❌

```bash
curl -X POST http://127.0.0.1:5000/api/auth/register/delivery \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Runner",
    "email": "invalid@delivery.com",
    "phone": "123",
    "vehicle_type": "bike"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid phone number. Must be 10-15 digits"
}
```

### Test 5.3: Invalid Vehicle Type ❌

```bash
curl -X POST http://127.0.0.1:5000/api/auth/register/delivery \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Runner",
    "email": "runner@delivery.com",
    "phone": "9876543210",
    "vehicle_type": "spaceship"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid vehicle type. Must be: bike, scooter, car, or bicycle"
}
```

### Test 5.4: Missing Required Fields ❌

```bash
curl -X POST http://127.0.0.1:5000/api/auth/register/restaurant \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Incomplete"
    # Missing: email, phone, shop_name, address
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Missing required fields: email, phone, shop_name, address"
}
```

### Test 5.5: Invalid Email Format ❌

```bash
curl -X POST http://127.0.0.1:5000/api/auth/register/restaurant \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Chef",
    "email": "not-an-email",
    "phone": "9876543210",
    "shop_name": "Test Pizza",
    "address": "123 Street"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid email format"
}
```

### Test 5.6: Unauthorized Access ❌

Try to access admin endpoint WITHOUT token:

```bash
curl -X GET http://127.0.0.1:5000/api/admin/pending-users
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Missing Authorization Header"
}
```

---

## 6. Load Testing

### Simple Load Test (10 simultaneous requests)

```bash
#!/bin/bash
# save as test_load.sh

for i in {1..10}; do
  (
    curl -s -X GET http://127.0.0.1:5000/api/health | \
    echo "Request $i completed"
  ) &
done
wait
echo "All requests completed"
```

**Run:**
```bash
chmod +x test_load.sh
./test_load.sh
```

---

## 7. Debugging Tips

### Enable Verbose Logging

In `backend/app/__init__.py`, increase log level:

```python
LOG_LEVEL=DEBUG
```

### View MongoDB Operations

In `backend/app/__init__.py`:

```python
logging.getLogger('mongoengine').setLevel(logging.DEBUG)
```

### Use Postman Console

1. Open Postman
2. Click **Postman Console** (bottom left)
3. You'll see all requests/responses with details

### Inspect Database Directly

```bash
# Connect to MongoDB
mongosh "mongodb+srv://fooduser:Fv7%40FoodApp123@cluster0.qugxr.mongodb.net/fooddelivery"

# View users
db.users.find({}).pretty()

# View pending users
db.users.find({is_approved: false})
```

### Common Issues & Solutions

**Issue:** `404 Not Found` on auth routes
- **Solution:** Backend might not have redeployed yet (Render takes 2-3 minutes)
- **Check:** curl http://yumm-ym2m.onrender.com/api/version

**Issue:** CORS errors in browser
- **Solution:** Backend has CORS configured, but double-check CORS_ORIGINS in .env
- **Check:** Look for CORS headers in response

**Issue:** `Invalid token` errors
- **Solution:** Token might have expired or be malformed
- **Check:** Copy token from response and verify it's a valid JWT

**Issue:** `Email already exists` but can't login
- **Solution:** User might exist but not be approved
- **Check:** Query database: `db.users.find({email: "test@email.com"})`

---

## 📊 Quick Test Checklist

- [ ] Health check endpoint working
- [ ] Customer Google login succeeds
- [ ] Restaurant registration creates pending user
- [ ] Unapproved restaurant can't login
- [ ] Admin can view pending users
- [ ] Admin can approve restaurant
- [ ] Approved restaurant can login
- [ ] Delivery partner registration works
- [ ] Admin can reject delivery partner
- [ ] Duplicate email prevention works
- [ ] Invalid phone rejection works
- [ ] Invalid vehicle type rejection works
- [ ] Missing fields validation works
- [ ] Unauthorized users blocked from admin endpoints

---

## 🚀 Automating Tests

### Python Test Script

See `test_live_backend.py` in repository for complete automated testing.

### GitHub Actions CI/CD

Add to `.github/workflows/test.yml`:

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
      - name: Run tests
        run: python test_live_backend.py
```

---

**Last Updated:** 2026-04-07
**Version:** 1.0
**Status:** Production Ready ✅
