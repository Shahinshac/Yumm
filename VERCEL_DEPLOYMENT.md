# 🚀 Vercel Deployment Guide - Complete Setup

## Overview

Deploy **FoodHub** to Vercel with serverless backend API:
- **Frontend:** Flutter web app served from root
- **Backend:** Flask API as serverless functions (Python 3.9)
- **Database:** MongoDB Atlas (already configured)
- **Cost:** Free tier with auto-scaling

---

## Prerequisites

✅ GitHub repository with latest code pushed
✅ Vercel account (free at https://vercel.com)
✅ MongoDB Atlas cluster with URI
✅ Environment variables ready

---

## Step 1: Prepare Environment Variables

Copy your MongoDB credentials and generate secure keys:

```bash
# Generate random SECRET_KEY and JWT_SECRET_KEY
python3 -c "import secrets; print('SECRET_KEY:', secrets.token_urlsafe(32))"
python3 -c "import secrets; print('JWT_SECRET_KEY:', secrets.token_urlsafe(32))"
```

**Keep these safe** - you'll need them for Vercel environment variables.

---

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository: `Shahinshac/Yumm`
4. **Configure project:**
   - Framework Preset: **Other**
   - Root Directory: `.` (current directory)
5. **Environment Variables** - Add all of these:

```
FLASK_ENV = production
MONGODB_URI = mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER.mongodb.net/fooddelivery?retryWrites=true&w=majority
SECRET_KEY = <your generated secret key>
JWT_SECRET_KEY = <your generated JWT secret>
CORS_ORIGINS = https://YOUR_VERCEL_DOMAIN.vercel.app,http://localhost:3000
PYTHONUNBUFFERED = 1
```

6. **Click "Deploy"** - Vercel will automatically:
   - Build Flutter web from `frontend-mobile/build/web`
   - Install Python dependencies from `backend/requirements.txt`
   - Create serverless function from `api/index.py`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /path/to/Yumm
vercel

# Add environment variables
vercel env add MONGODB_URI
vercel env add SECRET_KEY
vercel env add JWT_SECRET_KEY
vercel env add CORS_ORIGINS

# Redeploy with env vars
vercel --prod
```

---

## Step 3: Verify Deployment

### Check Backend API

```bash
# Replace YOUR_DEPLOYMENT with actual domain
curl https://YOUR_DEPLOYMENT.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "message": "FoodHub Backend is running",
  "database": "connected",
  "users": 0
}
```

### Check Frontend

```
https://YOUR_DEPLOYMENT.vercel.app
```

Should load FoodHub login page.

---

## Step 4: Update Backend Configuration

The API service is already configured for relative URLs (`/api`), which works on Vercel because both frontend and backend are on the same domain.

**If you need to use an external Render backend**, update the API service:

```dart
// In frontend-mobile/lib/services/api_service.dart
static const String baseUrl = 'https://yumm-ym2m.onrender.com/api';
```

Then redeploy.

---

## Step 5: Enable Features

### Database Seeding

To enable demo data on first deployment:

```
ENABLE_DEMO_DATA = true
```

Create demo restaurants, users, and menu items automatically on first run.

### SMS Notifications (Optional)

Add AWS credentials for SMS:

```
AWS_ACCESS_KEY_ID = your-key-id
AWS_SECRET_ACCESS_KEY = your-secret
ENABLE_SMS_NOTIFICATIONS = true
```

---

## Monitoring & Logs

### View Deployment Logs

Vercel Dashboard → Project → Deployments → Click deployment → Logs

### View API Function Logs

Vercel Dashboard → Project → Functions → Click function → Logs

### Monitor Errors

Set log level in environment:

```
LOG_LEVEL = DEBUG  # for verbose logging
```

---

## Troubleshooting

### Build Failed

**Error:** "Flutter not found"
- **Solution:** Vercel doesn't have Flutter CLI by default
- **Workaround:** Pre-build Flutter web, commit `build/web/` folder

```bash
cd frontend-mobile
flutter build web --release
cd ..
git add frontend-mobile/build/web/
git commit -m "Pre-build Flutter web for Vercel"
git push
```

Then update `vercel.json`:

```json
{
  "buildCommand": "exit 0",
  "outputDirectory": "frontend-mobile/build/web"
}
```

### API 500 Errors

**Problem:** Backend returning 500 on login
- Check MongoDB connection: verify `MONGODB_URI` in environment
- Check environment variables: all required vars set?
- View function logs: Vercel Dashboard → Functions → Logs

### CORS Issues

**Problem:** "CORS policy: No 'Access-Control-Allow-Origin' header"
- Verify `CORS_ORIGINS` environment variable includes your Vercel domain
- Ensure it's: `https://YOUR_DOMAIN.vercel.app` (no trailing slash)

---

## Performance Optimization

### Function Timeout

Default: 30 seconds
- Can increase in `vercel.json` (Pro plan required)

### Memory Allocation

Default: 1024 MB
- Adjust in `vercel.json` for heavier workloads

```json
{
  "functions": {
    "api/index.py": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### Cold Start

Functions sleep after inactivity. First request takes ~1-2 seconds.

**Solution:** Use Vercel Pro for consistent performance.

---

## Custom Domain

1. Vercel Dashboard → Project Settings → Domains
2. Add custom domain
3. Update DNS records as instructed
4. Update `CORS_ORIGINS` environment variable
5. Redeploy

---

## Rollback

If deployment fails:

1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click → **Promote to Production**

No code changes needed - instantly rolls back.

---

## Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| **Vercel Hosting** | FREE | Serverless frontend + API functions |
| **MongoDB Atlas** | FREE (up to 512MB) | Generous free tier |
| **Domain** | FREE | Using vercel.app subdomain |
| **Total per month** | $0 | Scales up only if you exceed free limits |

Upgrade to Vercel Pro ($20/month) for:
- Priority support
- Longer function timeouts (60 seconds)
- Advanced analytics
- Custom function memory

---

## Next Steps

✅ Deployment complete!

1. **Test all features** on Vercel
2. **Create demo users** via registration
3. **Test ordering flow** end-to-end
4. **Monitor logs** for errors
5. **Optimize** based on usage

---

## Support

**Issues?**

- **Vercel Docs:** https://vercel.com/docs
- **Flask Docs:** https://flask.palletsprojects.com
- **GitHub Issues:** https://github.com/Shahinshac/Yumm/issues

---

**Status:** Ready to deploy! 🚀

Follow the steps above to have FoodHub live on Vercel in minutes.
