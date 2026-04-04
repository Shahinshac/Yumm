# Replit + Vercel Troubleshooting Guide

Quick solutions for common deployment issues.

---

## 🔴 Frontend Can't Connect to Backend API

### Symptom
```
GET https://your-replit.replit.dev/api/... 404 or CORS error
```

### Solutions

#### 1. Check CORS Configuration
```bash
# In Replit backend, verify .env has correct CORS_ORIGINS:
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

#### 2. Restart Backend
```bash
# In Replit:
1. Click "Stop" button
2. Wait 5 seconds
3. Click "Run" button
4. Wait for "Flask app started" message
```

#### 3. Verify Replit Backend is Running
```bash
# Test API health check
curl https://your-replit-username.replit.dev/health

# Should return: {"status": "healthy"}
```

#### 4. Check Frontend Environment Variable
```bash
# In Vercel project settings:
Environment Variables → Check REACT_APP_API_URL
Should be: https://your-replit-username.replit.dev
```

#### 5. Redeploy Frontend
```bash
# On Vercel dashboard:
1. Deployments tab
2. Click "Redeploy" on latest deployment
3. Wait for build to complete
```

---

## 🔴 Replit Shows "Address Already in Use"

### Symptom
```
Error: Address already in use :::5000
```

### Solution
```bash
# Restart Replit:
1. Click "Stop" button
2. Wait 10 seconds (let port release)
3. Click "Run" button

# OR: Manually kill process
lsof -i :5000
kill -9 <PID>
```

---

## 🔴 PostgreSQL Connection Refused

### Symptom
```
Error: could not connect to server: Connection refused
Is the server running on host "localhost" (127.0.0.1) and accepting
TCP/IP connections on port 5432?
```

### Solutions

#### 1. Check PostgreSQL Service
```bash
# In Replit shell:
pg_isready

# Should output: accepting connections
```

#### 2. Start PostgreSQL Manually
```bash
pg_ctl start

# If that fails:
mkdir -p ~/.local/share/postgresql
initdb
pg_ctl start
```

#### 3. Check DATABASE_URL
```bash
# .env should have:
DATABASE_URL=postgresql://bankuser:bankpass123@localhost:5432/bankmanagement

# Verify database exists:
psql -U postgres -l | grep bankmanagement
```

#### 4. Force Reinitialization
```bash
# In Replit shell:
cd backend
bash ../scripts/init_replit.sh

# This will:
# - Kill old PostgreSQL
# - Reinitialize database
# - Create schema
# - Start Flask
```

---

## 🔴 Replit Won't Start Flask

### Symptom
```
Python errors, imports failing, Flask not starting
```

### Solutions

#### 1. Check for Syntax Errors
```bash
cd backend
python -m py_compile app/__init__.py
python -m py_compile app/models/*.py
python -m py_compile app/routes/*.py
```

#### 2. Verify Dependencies
```bash
pip list | grep -i flask
pip list | grep -i sqlalchemy

# If missing, reinstall:
pip install -r requirements.txt
```

#### 3. Check .env File Exists
```bash
ls -la backend/.env

# If missing, create:
cd backend
python -c "import secrets; print(secrets.token_urlsafe(32))" > SECRET_KEY.txt
```

#### 4. Test Flask Import
```bash
python -c "from flask import Flask; print('Flask OK')"
```

---

## 🔴 Vercel Build Fails

### Symptom
```
Build Error: Command failed: npm run build
```

### Solutions

#### 1. Check Build Logs
```
On Vercel dashboard:
1. Go to Deployments
2. Click failed deployment
3. Check Build logs (red text)
4. Scroll to find actual error
```

#### 2. Verify Node Version
```bash
# Local:
node --version  # Should be 18+

# Vercel settings → Environment variables:
NODE_VERSION=18
```

#### 3. Clear Cache & Rebuild
```
On Vercel dashboard:
1. Project settings → Git
2. Scroll down → "Ignore Build Step"
3. Leave blank
4. Deployments → Click "Redeploy"
5. Check "Use Cache" checkbox OFF
```

#### 4. Check .vercelignore
```bash
# Make sure .vercelignore doesn't exclude frontend/:
cat .vercelignore | grep frontend

# If frontend/ is excluded, remove that line
```

---

## 🔴 Vercel "Module not found" Error

### Symptom
```
Error: Cannot find module 'react' or similar
Error: Missing required dependency
```

### Solution

#### 1. Check dependencies Installed
```bash
ls -la frontend/node_modules | wc -l
# Should show many directories

# If empty:
cd frontend
npm install
```

#### 2. Verify Package.json
```bash
cat frontend/package.json | grep -A5 "dependencies"

# Should include: react, axios, zustand, react-router-dom
```

#### 3. Force Fresh Install on Vercel
```
On Vercel:
1. Project settings → Build & Development Settings
2. Install Command: npm install --force
3. Build Command: npm run build
4. Redeploy
```

---

## 🔴 Frontend Blank/Not Loading

### Symptom
```
Browser shows blank page, no errors
```

### Solutions

#### 1. Wait for Deploy
```
Vercel deployments take ~30-60 seconds
Check Deployments tab for "Ready" status
```

#### 2. Hard Refresh Browser
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
# Clear browser cache and reload
```

#### 3. Check Browser Console
```
1. Press F12 (Developer Tools)
2. Go to Console tab
3. Look for red error messages
4. Scroll up to see first error
```

#### 4. Verify Build Output
```
On Vercel dashboard → Deployments:
Click successful deployment → Preview button
Should load without errors
```

---

## 🔴 Database Schema Missing

### Symptom
```
Error: relation 'user' does not exist
Error: Table users not found
```

### Solution

#### 1. Reinitialize Schema
```bash
cd backend

# Create tables:
python -c "
from app import create_app, db
app = create_app('production')
app.app_context().push()
db.create_all()
print('Tables created!')
"
```

#### 2. Verify Tables Exist
```bash
psql -U bankuser -d bankmanagement -c "\dt"

# Should show: users, accounts, transactions, etc.
```

#### 3. Reset Everything
```bash
# Full reset:
cd backend
bash ../scripts/init_replit.sh
# This reruns entire setup
```

---

## 🔴 CORS Errors in Browser Console

### Symptom
```
Access to XMLHttpRequest at 'https://...' from origin 'https://your-frontend.vercel.app'
has been blocked by CORS policy
```

### Solution

#### 1. Update Backend CORS
```bash
# In Replit, edit backend/.env:
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# OR use environment variable:
export CORS_ORIGINS=https://your-frontend.vercel.app
```

#### 2. Restart Backend
```bash
# Replit:
1. Click "Stop"
2. Click "Run"
3. Wait for startup
```

#### 3. Verify CORS Header
```bash
curl -i https://your-replit.replit.dev/health

# Should show header:
# Access-Control-Allow-Origin: https://your-frontend.vercel.app
```

---

## 🔴 "Replit is Hibernating"

### Symptom
```
"This repl is hibernating" message appears
```

### Cause
Replit free tier hibernates inactive projects after ~1 hour

### Solutions

#### Option 1: Use Replit Core (Paid)
```
Upgrade to Replit Core (~$7/month)
- Always active
- Better performance
- More storage
```

#### Option 2: Keep Alive Service (Free)
```
Use UptimeRobot or similar to ping your API every 5 minutes:
1. Go to uptimerobot.com
2. Create new monitor
3. URL: https://your-replit.replit.dev/health
4. Interval: 5 minutes
5. Your repl stays awake!
```

---

## 📞 Getting Help

### Check Logs

**Replit Logs**:
```bash
# View real-time logs while running
# Appears in right panel automatically
# Scroll up to see initialization messages
```

**Vercel Logs**:
```
Dashboard → Deployments → Click deployment → View Function Logs
```

### Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| `Connection refused` | Backend not running | Restart Replit |
| `CORS error` | Frontend URL not in CORS_ORIGINS | Update .env |
| `404 Not Found` | Wrong API URL | Check REACT_APP_API_URL |
| `500 Internal Server` | Backend code error | Check Replit logs |
| `Module not found` | Missing dependency | npm install |
| `Build failed` | Frontend build error | Check Vercel logs |

### Need More Help?

1. **GitHub Issues**: https://github.com/Shahinshac/bankmanagement/issues
2. **Replit Help**: https://docs.replit.com
3. **Vercel Docs**: https://vercel.com/docs
4. **Check this file again**: Many issues are covered here!

---

## ✅ Verification Checklist

After deployment, verify everything works:

```bash
□ Backend starts without errors
□ Replit shows "Flask app started" message
□ curl https://your-replit.replit.dev/health returns healthy
□ Vercel deployment shows "Ready"
□ Frontend loads in browser
□ Frontend can login to backend
□ No CORS errors in browser console
□ No errors in Replit logs
□ API endpoints return data
□ Database queries work
```

---

**Your deployment is complete when ALL checkboxes are ticked! ✅**
