# Deployment Guide - Vercel & Render

## Quick Overview

This guide covers deploying the Digital Banking System to:
- **Frontend**: Vercel (React)
- **Backend**: Render (Flask)
- **Database**: PostgreSQL on Railway or Render

Total deployment time: ~30-45 minutes

---

## PART 1: Database Setup (Railway or Render)

### Option A: Using Railway (Recommended)

1. Go to https://railway.app
2. Sign up with GitHub account
3. Create new project → PostgreSQL
4. Wait for database to initialize
5. Note the connection details:
   - Host: `[host].railway.app`
   - Port: `[port]`
   - Username: `postgres`
   - Password: (provided)
   - Database: `railway`

### Option B: Using Render

1. Go to https://render.com
2. Create PostgreSQL database
3. Note credentials from connection string

**Connection String Format**:
```
postgresql://username:password@host:port/databasename
```

---

## PART 2: Backend Deployment on Render

### Step 1: Create Render Account
- Visit https://render.com
- Sign up with GitHub

### Step 2: Connect GitHub Repository
1. Click "New +" → "Web Service"
2. Select "Connect a repository"
3. Authorize Render for your GitHub account
4. Select `bankmanagement` repository
5. Select `backend` as root directory

### Step 3: Configure Backend Service
**Basic Settings**:
- **Name**: `bankmanagement-api`
- **Environment**: `Docker` OR `Python`
- **Region**: Choose closest to users
- **Branch**: `main`

**If using Python runtime**:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT run:app`

### Step 4: Set Environment Variables
Click "Advanced" → "Environment Variables", add:

```
FLASK_ENV=production
SECRET_KEY=[generate-random-string-128-chars]
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET_KEY=[generate-random-string-128-chars]
CORS_ORIGINS=https://your-frontend-domain.vercel.app
DEBUG=False
BCRYPT_LOG_ROUNDS=12
```

**Generate secure secrets**:
```bash
# In terminal, run:
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 5: Deploy
- Click "Create Web Service"
- Render will automatically deploy from GitHub
- Wait for build to complete (5-10 minutes)
- Note the backend URL: `https://bankmanagement-api.onrender.com`

### Step 6: Test Backend
```bash
curl https://bankmanagement-api.onrender.com/api/auth/me
# Should return 401 (not authenticated) - this is expected
```

---

## PART 3: Frontend Deployment on Vercel

### Step 1: Create Vercel Account
- Visit https://vercel.com
- Sign up with GitHub

### Step 2: Import Project
1. Click "Add New" → "Project"
2. "Import Git Repository"
3. Enter: `https://github.com/Shahinshac/bankmanagement`
4. Click "Import"

### Step 3: Configure Frontend
**Framework**: React
**Root Directory**: `./frontend`

### Step 4: Set Environment Variables
Before deploying, add environment variables:

Click "Environment Variables":
```
REACT_APP_API_URL = https://bankmanagement-api.onrender.com/api
REACT_APP_API_TIMEOUT = 10000
```

### Step 5: Deploy
1. Review settings
2. Click "Deploy"
3. Wait for build (2-5 minutes)
4. Get frontend URL: `https://your-project.vercel.app`

### Step 6: Update Backend CORS
Go back to Render backend settings:
- Update `CORS_ORIGINS` to: `https://your-project.vercel.app`
- Redeploy backend

---

## PART 4: Database Initialization

### Step 1: Connect to Database
From your database provider (Railway/Render), get connection string.

### Option A: Using psql locally
```bash
psql postgresql://user:password@host:port/dbname

# In psql, create tables (copy and paste from run.py Flask shell)
```

### Option B: Using Python locally
```bash
# Update backend/.env with DATABASE_URL
FLASK_ENV=production
DATABASE_URL=postgresql://user:password@host:port/dbname

# Run initialization
cd backend
export DATABASE_URL=postgresql://user:password@host:port/dbname
flask db init
flask cli init_db
```

### Option C: Using Render/Railway console
1. Go to database dashboard
2. Click "Connect" → "psql"
3. Run SQL commands to create tables

---

## PART 5: Verification Checklist

### Backend Verification
- [ ] Service deployed and running on Render
- [ ] Environment variables set correctly
- [ ] Database connection working
- [ ] Can access API: `https://your-api.onrender.com/api/auth/me` (should return 401)

### Frontend Verification
- [ ] App deployed on Vercel
- [ ] Can access frontend: `https://your-app.vercel.app`
- [ ] Environment variable `REACT_APP_API_URL` points to backend
- [ ] Login page loads without errors

### Integration Test
1. Go to frontend URL
2. Click Login
3. Enter test credentials:
   - Username: `admin`
   - Password: (check if user exists in DB)
4. Should successfully authenticate

---

## PART 6: Troubleshooting

### Backend Won't Start
**Error**: "MODULE NOT FOUND"
- Solution: Check `requirements.txt` includes `gunicorn`
- Re-push to GitHub, Render will redeploy

**Error**: "DATABASE CONNECTION FAILED"
- Solution: Verify `DATABASE_URL` environment variable
- Check database is running and accessible
- Test locally first

### Frontend Shows "Cannot connect to API"
**Error**: CORS errors in browser console
- Solution: Update backend `CORS_ORIGINS` environment variable
- Must include frontend URL: `https://your-app.vercel.app`
- Redeploy backend after changing CORS

**Error**: "API_URL is undefined"
- Solution: Check `REACT_APP_API_URL` in Vercel environment variables
- Rebuild on Vercel (redeploy) after setting variables

### Login Not Working
- Check backend database has users
- Verify JWT_SECRET_KEY is set on backend
- Check frontend is sending credentials to correct API URL

---

## PART 7: Production Best Practices

### Security
1. Change all default secrets
2. Use strong DATABASE_URL credentials
3. Enable HTTPS (done automatically on Vercel/Render)
4. Set DEBUG=False in production
5. Update CORS_ORIGINS to only include frontend domain

### Monitoring
1. Add Render logs monitoring
2. Set up error tracking (Sentry optional)
3. Monitor database performance
4. Track API response times

### Scaling
- Render auto-scales based on load
- Upgrade database if needed
- Use Vercel's built-in analytics

---

## PART 8: Custom Domain (Optional)

### Frontend Custom Domain
1. In Vercel, go to "Settings" → "Domains"
2. Add your domain
3. Update DNS records as instructed
4. Update backend CORS_ORIGINS to new frontend domain

### Backend Custom Domain
1. In Render, go to "Settings" → "Custom Domains"
2. Add your domain
3. Update frontend `REACT_APP_API_URL` to new backend domain

---

## PART 9: Continuous Deployment

Both Vercel and Render auto-deploy on GitHub push:
- **Frontend**: Auto-deploys on push to `main` in `frontend/` directory
- **Backend**: Auto-deploys on push to `main` in `backend/` directory

### To Deploy Changes:
```bash
git add .
git commit -m "Update feature X"
git push origin main
# Vercel/Render will automatically deploy
```

---

## Quick Reference URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://bankmanagement-api.onrender.com/api`
- **Database**: Managed by Railway/Render

---

## Support & Next Steps

If you encounter issues:
1. Check Render logs: Dashboard → Logs tab
2. Check Vercel logs: Deployments tab → Build logs
3. Test locally first to isolate issues
4. Verify environment variables are set correctly

Ready to go live! 🚀
