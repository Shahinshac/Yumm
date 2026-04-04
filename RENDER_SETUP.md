# Render Deployment Guide

## Step-by-Step Setup

### 1. Prepare Your Code
```bash
cd c:\Users\Shahinsha\.vscode\bankmanagement
git add -A
git commit -m "Add Render deployment configuration"
git push
```

### 2. Create Render Account
1. Go to https://render.com
2. Sign up (free account)
3. Connect your GitHub account

### 3. Deploy Backend

**Option A: Using render.yaml (Recommended)**
1. Click "New +" → "Blueprint"
2. Select your GitHub repository: `Shahinshac/bankmanagement`
3. Choose branch: `main`
4. Render will auto-detect `render.yaml` and create:
   - PostgreSQL database
   - Web service (backend)
5. Click "Deploy"

**Option B: Manual Setup**
1. Click "New +" → "Web Service"
2. Connect GitHub: `Shahinshac/bankmanagement`
3. Fill in:
   - **Name**: `bankmanagement-api`
   - **Environment**: Python 3
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && gunicorn --bind 0.0.0.0:$PORT run:app`
4. Under "Environment":
   - Add all variables from `backend/.env`

### 4. Add Environment Variables to Render
In Render Dashboard → Your Web Service → Environment:

```
FLASK_ENV=production
FLASK_APP=run.py
SECRET_KEY=[generate random string]
JWT_SECRET_KEY=[generate random string]
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=604800
BCRYPT_LOG_ROUNDS=12
DEBUG=False
CORS_ORIGINS=https://your-vercel-frontend.vercel.app,http://localhost:3000
```

For PostgreSQL, if using render.yaml:
- Render auto-creates and provides: `DATABASE_URL`

If manual setup, add your PostgreSQL connection string.

### 5. Get Your Backend URL
After deployment finishes:
1. Go to Render Dashboard
2. Click your web service
3. Copy the URL (e.g., `https://bankmanagement-api.onrender.com`)

### 6. Update Frontend
Update `frontend/.env.local`:
```
REACT_APP_API_URL=https://bankmanagement-api.onrender.com/api
```

### 7. Redeploy Frontend on Vercel
1. Push frontend changes to GitHub
2. Vercel auto-redeploys
3. Test login/registration

## Troubleshooting

### Build Fails
- Check logs: Render Dashboard → Web Service → Logs
- Common issue: Missing `Procfile` (already created)

### Database Connection Error
- Verify `DATABASE_URL` in Environment Variables
- Check if render.yaml created database automatically

### CORS Errors
- Update `CORS_ORIGINS` in environment variables
- Include your Vercel frontend URL

### Login Still Fails
Create admin user in Render:
1. Go to Render Web Service
2. Click "Shell" tab
3. Run:
   ```bash
   cd backend && flask create-admin
   ```

## Cost Information
- **Free tier**: Limited hours/month (paid after that)
- **Paid**: $7/month for continuous uptime
- **PostgreSQL**: Included in free tier

**Tip**: If cost is an issue, stick with **Replit** (completely free)
