# MongoDB Atlas Setup & Troubleshooting Guide

## Current Status: SSL/TLS Connection Issue

**Error:** `SSL handshake failed: [SSL: TLSV1_ALERT_INTERNAL_ERROR]`

**Root Cause:** MongoDB Atlas has strict IP whitelist security. Render's deployment IP is not whitelisted.

---

## ✅ Quick Fix: Add Render to IP Whitelist

### Option 1: Allow All IPs (Quick Testing - NOT Recommended for Production)

1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Select your project "foodhub"
3. Go to **Network Access** → **IP Whitelist**
4. Click **"Add IP Address"**
5. Enter: `0.0.0.0/0` (allows all IPs globally)
6. Click **"Confirm"**
7. Wait 1-2 minutes for changes to propagate

**⚠️ Security Note:** This opens your database to the internet. Only use for development/testing.

### Option 2: Allow Render IP Range (Recommended)

1. Get Render's current IP from your deployment logs
2. In MongoDB Atlas **Network Access** → **IP Whitelist**
3. Add the specific Render IP or IP range
4. **Problem:** Render IPs can change; you may need to update periodically

### Option 3: Allow Only Your Deployment (Most Secure)

Render has static outbound IPs on Pro plans. For free tier, use Option 1 temporarily or upgrade.

---

## 🔍 Verify the Fix

### Test Backend Connectivity

```bash
curl https://yumm-ym2m.onrender.com/api/health
```

Expected response (if connected):
```json
{
  "status": "healthy",
  "message": "FoodHub Backend is running",
  "database": "connected",
  "users": 0
}
```

Error response (if not connected):
```json
{
  "status": "unhealthy",
  "message": "FoodHub Backend is running but database is not accessible",
  "error": "SSL handshake failed..."
}
```

---

## 📋 MongoDB Atlas Configuration Checklist

### Network Access (Security)
- [ ] IP Whitelist includes your deployment IPs
- [ ] Consider firewall rules if using private endpoints
- [ ] Use database-level authentication (users & passwords)

### Cluster Settings
- [ ] M0 (Free) cluster is sufficient for this project
- [ ] Ensure cluster is "Running" (not paused)
- [ ] Check cluster region matches deployment region if possible
- [ ] Enable automatic backups (optional but recommended)

### Database Users
- [ ] Database user "foodhub_user" exists
- [ ] User has password set (fooddbadmin)
- [ ] User has "Read and write to any database" role (or specific DB role)
- [ ] Connection string uses this user's credentials

### Connection String
Expected format:
```
mongodb+srv://foodhub_user:fooddbadmin@foodhub.yqgznxh.mongodb.net/fooddelivery?retryWrites=true&w=majority
```

Parameters explained:
- `mongodb+srv://` - Secure connection (auto SSL/TLS)
- `foodhub_user:fooddbadmin` - Database credentials
- `foodhub.yqgznxh` - Your cluster name
- `mongodb.net` - MongoDB Atlas domain
- `/fooddelivery` - Database name
- `?retryWrites=true` - Automatically retry failed writes
- `&w=majority` - Wait for write confirmation from majority of servers

---

## 🛠️ Render Deployment Configuration

### Environment Variables Required

In Render dashboard for your backend service:

```
FLASK_ENV = production
MONGODB_URI = mongodb+srv://foodhub_user:fooddbadmin@foodhub.yqgznxh.mongodb.net/fooddelivery?retryWrites=true&w=majority
SECRET_KEY = (random 32+ character string)
JWT_SECRET_KEY = (random 32+ character string)
CORS_ORIGINS = https://your-frontend-url.vercel.app,http://localhost:3000
DEBUG = False
PYTHON_VERSION = 3.12
```

**Important:** Use **Environment Variables** (not .env file) on Render for secrets.

---

## 🚀 Trigger Backend Redeploy

After updating MongoDB Atlas IP whitelist:

1. Go to Render dashboard
2. Select your backend service
3. Click **"Manual Deploy"** or **"Redeploy"**
4. Wait for deployment to complete
5. Check logs for "✅ MongoDB connected successfully"

---

## 📊 Diagnostic Logging

The updated backend now logs detailed SSL/TLS diagnostics:

**Successful connection:**
```
INFO Detected mongodb+srv:// connection - SSL/TLS enabled
INFO SSL/TLS parameters configured: cert_reqs=REQUIRED, hostname_matching=ENABLED
INFO ✅ MongoDB connected successfully
```

**Connection failure with diagnostics:**
```
ERROR ❌ MongoDB connection failed: SSL handshake failed
ERROR ⚠️  SSL/TLS Connection Error Detected:
ERROR    1. Check MongoDB Atlas IP Whitelist
ERROR    2. Verify connection string format and credentials
ERROR    3. Ensure Render backend is deployed in same region
ERROR    4. Check MongoDB Atlas firewall rules
```

---

## 🔧 Local Development Setup

If testing locally before Render deployment:

1. **For Local MongoDB:**
   ```bash
   # Use local connection string (no SSL needed)
   MONGODB_URI=mongodb://localhost:27017/fooddelivery
   ```

2. **For MongoDB Atlas from Local Machine:**
   ```bash
   # Add your machine's IP to MongoDB Atlas IP Whitelist
   # Or use 0.0.0.0/0 (less secure)
   MONGODB_URI=mongodb+srv://foodhub_user:fooddbadmin@foodhub.yqgznxh.mongodb.net/fooddelivery?retryWrites=true&w=majority
   ```

3. **Test connection:**
   ```bash
   python backend/run.py
   # Look for "✅ MongoDB connected successfully" in logs
   ```

---

## ❌ Common Issues & Solutions

### Issue 1: "SSL handshake failed"
**Solution:**
- Add your IP to MongoDB Atlas IP Whitelist
- For Render: add `0.0.0.0/0` temporarily
- Check credentials in MONGODB_URI

### Issue 2: "Connect timeout exceeded"
**Solution:**
- MongoDB cluster may be paused/stopped
- Check MongoDB Atlas cluster status
- Verify IP whitelist settings

### Issue 3: "Authentication failed"
**Solution:**
- Verify database username and password
- Check for special characters in password (URL encode if needed)
- Ensure user has database access permissions

### Issue 4: "Database not found"
**Solution:**
- Ensure `/fooddelivery` database name is in connection string
- MongoDB Atlas auto-creates database on first write

---

## 📚 MongoDB Atlas Resources

- **Dashboard:** https://cloud.mongodb.com/
- **IP Whitelist Guide:** https://docs.mongodb.com/atlas/security-ip-access-list/
- **Connection Strings:** https://docs.mongodb.com/manual/reference/connection-string/
- **PyMongo SSL:** https://pymongo.readthedocs.io/en/stable/examples/ssl.html

---

## 🎯 Next Steps

1. ✅ Add Render IP to MongoDB Atlas whitelist (or use 0.0.0.0/0)
2. ✅ Verify MONGODB_URI is set in Render environment variables
3. ✅ Trigger manual redeploy on Render
4. ✅ Test `/api/health` endpoint
5. ✅ Check Render logs for SSL connection diagnostics
6. ✅ Verify database operations work (login, create orders, etc.)

