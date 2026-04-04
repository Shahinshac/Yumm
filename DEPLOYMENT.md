# Bank Management System - Deployment Guide

This guide covers deploying the banking system to **Vercel (Frontend)** and **Replit (Backend)** - both completely free, no card required.

---

## Quick Start

### Prerequisites
- GitHub account
- Vercel account (free)
- Replit account (free)

---

## Backend Deployment (Replit)

### Step 1: Create Replit Project
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl" → Select "Python"
3. Give it a name: `bankmanagement-api`

### Step 2: Connect to GitHub
1. In Replit, go to **Version Control** → **Connect to GitHub**
2. Select this repository
3. Choose the `main` branch

### Step 3: Environment Variables
In Replit **Secrets** (click lock icon), add:
```
DATABASE_URL=postgresql://user:password@localhost/bankdb
JWT_SECRET=your-secret-key-here
FLASK_ENV=production
FLASK_APP=run
CORS_ORIGINS=*
```

For DATABASE_URL, Replit provides PostgreSQL. Use:
```
postgresql://replit:replit@localhost/bankdb
```

### Step 4: Install & Run
In Replit shell:
```bash
cd backend
pip install -r requirements.txt
python run.py
```

Your API will be available at: `https://your-replit-username.replit.dev`

### Step 5: Keep Alive (Optional)
Add this to your `.replit` file:
```
run = "cd backend && gunicorn -w 4 -b 0.0.0.0:5000 run:app"
```

---

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select this GitHub repository
4. Select "Next.js" or "Create React App" as framework

### Step 2: Environment Variables
In Vercel Project Settings → Environment Variables, add:
```
REACT_APP_API_URL=https://your-replit-username.replit.dev
```

### Step 3: Deploy
Click "Deploy" - Vercel will automatically:
- Install dependencies
- Build the React app
- Deploy to CDN

Your frontend will be available at: `https://your-vercel-project.vercel.app`

---

## Testing the Connection

1. Open your frontend: `https://your-vercel-project.vercel.app`
2. Try logging in or creating an account
3. Check browser console for any errors
4. Verify API calls reach your Replit backend

---

## Troubleshooting

### Frontend can't reach API
- Check `REACT_APP_API_URL` env var in Vercel
- Verify Replit backend is running
- Check browser console for CORS errors

### Database connection fails on Replit
- Ensure PostgreSQL is running (`SELECT 1;` in shell)
- Create the database: `createdb bankdb`
- Run migrations if needed

### Replit keeps stopping
- Upgrade to Replit Core (paid) OR
- Use a UptimeRobot/monitoring service to ping your API every 5 minutes

---

## Important Notes

- **Replit free tier**: Limited compute/memory, may need upgrade for production
- **Vercel free tier**: Supports unlimited deployments, auto-scales
- **Database**: Replit PostgreSQL is volatile (resets on reboot)
- For production, consider paid tiers on either platform

---

## Git Workflow

```bash
# Make changes locally
git add .
git commit -m "your message"
git push origin main

# Both Replit and Vercel auto-deploy on push
```

---

**Status**: ✅ Configured for free tier deployment
