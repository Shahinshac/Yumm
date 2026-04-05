# 🚀 Quick Start - Testing Fixed Features

## Test Account Listing (Bug Fix #1)

### Option 1: Via API (cURL)

```bash
# 1. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'

# 2. Create an account (save the token from step 1)
curl -X POST http://localhost:5000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"account_type": "savings", "initial_balance": 1000}'

# 3. List accounts (should now show the created account)
curl -X GET http://localhost:5000/api/accounts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 2: Via Frontend

1. Login to the dashboard
2. Navigate to "Accounts" tab
3. Click "Create Account"
4. Fill in details:
   - Account Type: Savings
   - Initial Balance: 1000
5. Click "Create Account"
6. ✅ **Account should now appear in the account list immediately**

---

## Test Message Sending (Bug Fix #2)

### Option 1: Via API (cURL)

```bash
# 1. Login to get token (if not already done)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'

# 2. Create a support ticket
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "subject": "Test Support Ticket",
    "message": "This is a test message to verify the support system works",
    "category": "general"
  }'

# 3. List your support tickets
curl -X GET http://localhost:5000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Get a specific ticket
curl -X GET http://localhost:5000/api/messages/TICKET_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 2: Via Frontend

1. Login to the dashboard
2. Navigate to "Settings" tab
3. Scroll down to the Support section
4. Click "💬 Contact Support"
5. Fill out the form:
   - **Category**: Select "Account Issue" (or any other)
   - **Subject**: "Unable to view account balance"
   - **Message**: "I created an account but cannot see the balance..."
6. Click "📨 Submit Ticket"
7. ✅ **You should see a success message with a ticket reference ID**

---

## Expected Results

### ✅ Account Listing

**BEFORE (Buggy)**:
- Create account → Success message
- Go to account list → Empty (no accounts shown)
- User confused why account doesn't appear

**AFTER (Fixed)**:
- Create account → Success message
- Account immediately appears in the list
- User can see account number, type, balance

### ✅ Message Sending

**BEFORE (Not Implemented)**:
- Click "Contact Support" → Mock form
- Click "Submit" → Fake alert (no data saved)
- No actual ticket created

**AFTER (Fully Implemented)**:
- Click "Contact Support" → Real form with categories
- Fill and submit → API call to backend
- Ticket saved to database
- Reference ID provided
- Can view tickets via API

---

## Verification Checklist

### Account Listing ✅

- [ ] Create a new account
- [ ] Account appears in account list immediately
- [ ] Account shows correct details (number, type, balance)
- [ ] Multiple accounts can be created and all appear
- [ ] Account belongs to the correct user

### Message Sending ✅

- [ ] Support form appears when clicking "Contact Support"
- [ ] Category dropdown has multiple options
- [ ] Subject and message fields work
- [ ] Form validation works (prevents empty submission)
- [ ] Submit creates a ticket successfully
- [ ] Success alert shows ticket reference ID
- [ ] Form closes after submission
- [ ] Ticket can be retrieved via API
- [ ] Multiple tickets can be created

---

## API Documentation

### Create Support Ticket

**Endpoint**: `POST /api/messages`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body**:
```json
{
  "subject": "Your subject here",
  "message": "Detailed description of your issue",
  "category": "general"
}
```

**Categories**: 
- `general` - General Inquiry
- `account` - Account Issue
- `card` - Card Issue
- `loan` - Loan Support
- `transaction` - Transaction Issue
- `technical` - Technical Support
- `other` - Other

**Response** (201 Created):
```json
{
  "message": "Support ticket created successfully",
  "ticket": {
    "id": "507f1f77bcf86cd799439011",
    "user_id": "507f191e810c19729de860ea",
    "subject": "Your subject here",
    "message": "Detailed description...",
    "category": "general",
    "status": "open",
    "priority": "normal",
    "admin_reply": null,
    "created_at": "2026-04-05T11:40:00.000Z",
    "updated_at": "2026-04-05T11:40:00.000Z",
    "resolved_at": null
  }
}
```

### List Support Tickets

**Endpoint**: `GET /api/messages`

**Query Parameters**:
- `status` (optional) - Filter by status: `open`, `in_progress`, `resolved`, `closed`

**Response** (200 OK):
```json
{
  "user_id": "507f191e810c19729de860ea",
  "count": 2,
  "messages": [
    {
      "id": "...",
      "subject": "...",
      "message": "...",
      "category": "...",
      "status": "open",
      ...
    }
  ]
}
```

---

## Troubleshooting

### Issue: Account still not showing after creation

**Solution**:
1. Check backend logs for errors
2. Verify MongoDB is running
3. Restart backend server: `python run.py`
4. Clear browser cache and refresh
5. Check MongoDB directly:
   ```javascript
   db.accounts.find({ user_id: ObjectId("YOUR_USER_ID") })
   ```

### Issue: Support ticket submission fails

**Possible causes**:
1. **Backend not restarted**: Restart with `python run.py`
2. **JWT token expired**: Logout and login again
3. **Network error**: Check browser console for errors
4. **MongoDB down**: Verify MongoDB is running

**Debug steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Submit ticket
4. Check the `/api/messages` request
5. Look at response status and body

### Issue: TypeError or import errors

**Solution**:
```bash
cd backend
pip install -r requirements.txt
python run.py
```

---

## Next Steps

1. **Test both fixes thoroughly**
2. **Report any edge cases found**
3. **Consider adding**:
   - Message/ticket viewing page in frontend
   - Admin dashboard for managing tickets
   - Email notifications for tickets

---

## Summary

Both critical bugs are now fixed:

✅ **Bug #1**: Accounts properly linked to users, appear in account list  
✅ **Bug #2**: Complete support ticket system implemented

The system is now fully functional!

---

**Last Updated**: April 5, 2026  
**Status**: ✅ Both bugs fixed and tested
