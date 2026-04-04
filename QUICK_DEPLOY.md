# Quick Deploy - 30 Minutes to Production

Follow these steps in order. Takes **~30 minutes**.

---

## Step 1: Prepare GitHub (5 min)

Your repo is already set up. Just verify:
```bash
git remote -v
# Should show: origin https://github.com/Shahinshac/bankmanagement.git
```

---

## Step 2: Create Database (5 min)

### Choose ONE:

**Option A: Railway** (Simpler)
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → PostgreSQL
4. Click PostgreSQL → Variables tab
5. Copy `DATABASE_URL` value (starts with `postgresql://`)
6. Keep this browser tab open ✓

**Option B: Render** (Alternative)
1. Go to https://render.com
2. New PostgreSQL Database
3. Wait for creation
4. Inside database, click "Info"
5. Copy "External Database URL"
6. Keep this browser tab open ✓

---

## Step 3: Deploy Backend on Render (10 min)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Click "Connect a repository"
4. Select `bankmanagement`
5. Fill form:
   - **Name**: `bankmanagement-api`  
   - **Region**: Select closest to you
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT run:app`

6. Click "Advanced"
7. Toggle "Auto-Deploy" to ON
8. Click "Add Environment Variable" and add these:

```
FLASK_ENV                production
SECRET_KEY              [GENERATE: python -c "import secrets; print(secrets.token_urlsafe(32))"]
DATABASE_URL            [PASTE YOUR DATABASE_URL FROM STEP 2]
JWT_SECRET_KEY          [GENERATE: python -c "import secrets; print(secrets.token_urlsafe(32))"]
CORS_ORIGINS            *
DEBUG                   False
BCRYPT_LOG_ROUNDS       12
```

9. Click "Create Web Service"
10. **Wait** for build (5-10 min) - watch the logs
11. Once status shows "Live", copy the URL (like `https://bankmanagement-api-xxxx.onrender.com`)
12. **Keep this URL** - you'll need it for frontend ✓

---

## Step 4: Deploy Frontend on Vercel (8 min)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Paste: `https://github.com/Shahinshac/bankmanagement`
5. Click "Import"
6. Fill form:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`

7. Click "Add Environment Variables"
8. Name: `REACT_APP_API_URL`
9. Value: `[PASTE YOUR BACKEND URL FROM STEP 3]/api`
   - Example: `https://bankmanagement-api-xxxx.onrender.com/api`

10. Click "Deploy"
11. **Wait** for build (2-5 min) - watch the logs
12. Once you see "Congratulations!", copy your Vercel URL
13. **Keep this URL** - your frontend is now live ✓

---

## Step 5: Update Backend CORS (2 min)

Go back to Render backend settings:
1. Click on your `bankmanagement-api` service
2. Click "Environment" tab
3. Edit `CORS_ORIGINS`:
   - Replace `*` with your Vercel URL
   - Example: `https://bankmanagement-xyz.vercel.app`
4. Click "Save"
5. Render will auto-redeploy

---

## Step 6: Test (2 min)

1. Go to your Vercel frontend URL
2. You should see login page
3. Test users (from previous setup):
   - Username: Try creating one or check database
4. If login fails:
   - Open browser DevTools → Network tab
   - Try login
   - Check if API requests go to correct URL
   - If red error, check backend is running

---

## 🎉 Done!

Your app is live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://bankmanagement-api-xxxx.onrender.com`

---

## If Something Goes Wrong

### Backend Won't Deploy
1. Go to Render → your service → "Logs"
2. Read error message
3. Common fixes:
   - Typo in `requirements.txt`
   - Missing environment variable
   - Database URL format wrong

### Frontend Won't Connect
1. Open DevTools (F12) → Console tab
2. Look for error about API URL
3. Check:
   - `REACT_APP_API_URL` is set in Vercel
   - Backend `CORS_ORIGINS` includes your Vercel URL
   - Backend is actually running

### Database Issues
1. Test connection locally first
2. Verify `DATABASE_URL` format:
   - Should be: `postgresql://user:pass@host:port/db`
3. Check database service is running

---

## Next: Custom Domain (Optional)

Want your own domain instead of `*.vercel.app`?

**Vercel**:
1. Settings → Domains
2. Add domain
3. Update DNS (Vercel will guide you)
4. Update backend `CORS_ORIGINS` to new domain

**Backend Domain**:
1. Render → Settings → Domains  
2. Add domain
3. Update frontend `REACT_APP_API_URL` to new domain

---

## Useful Links

- GitHub repo: https://github.com/Shahinshac/bankmanagement
- Vercel dashboard: https://vercel.com/dashboard
- Render dashboard: https://dashboard.render.com
- Railway dashboard: https://railway.app

---

**Total time**: ~30 minutes
**Result**: Your banking app is live on the internet! 🚀
