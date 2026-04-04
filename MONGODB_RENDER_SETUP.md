# 🚀 Complete Setup: MongoDB + Render + Vercel

**Free Tier Setup for 26-07 Reserve Bank System**

---

## 📋 **Overview**

| Component | Platform | Cost | Status |
|-----------|----------|------|--------|
| **Database** | MongoDB Atlas | FREE (512MB) | Cloud ☁️ |
| **Backend API** | Render | FREE | Cloud ☁️ |
| **Frontend** | Vercel | FREE | Already ✅ |

---

## ⏱️ **Total Setup Time: 30-40 minutes**

---

# **STEP 1: MongoDB Atlas Setup (5 minutes)**

## 1.1 Create Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click **"Sign Up"**
3. Enter email and password
4. Click **"Create Account"**

## 1.2 Create Free Cluster
1. Select **"Free"** tier
2. Click **"Create"**
3. Choose **AWS** region & closest location (e.g., `us-east-1`)
4. Click **"Create Cluster"**
5. **Wait 2-3 minutes** for cluster to initialize

## 1.3 Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Enter:
   - **Username:** `bankuser`
   - **Password:** `bankpass123mongo` (use strong password!)
4. Click **"Add User"**

## 1.4 Allow Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

## 1.5 Get Connection String
1. Go to **"Databases"** (top)
2. Click **"Connect"** on your cluster
3. Select **"Python"**
4. Copy the connection string that looks like:
   ```
   mongodb+srv://bankuser:bankpass123mongo@cluster0.xxxxx.mongodb.net/bankmanagement?retryWrites=true&w=majority
   ```
5. **Save this string - you'll need it!** 📌

---

# **STEP 2: Backend Code Update (10 minutes)**

## 2.1 Install MongoDB Dependencies

```bash
cd ~/workspace/backend
pip install mongoengine pymongo flask-mongoengine
```

## 2.2 Create MongoDB Config

Edit `backend/config.py` and replace with:

```python
import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    DEBUG = False

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    MONGODB_SETTINGS = {
        'db': 'bankmanagement',
        'host': os.getenv('MONGODB_URI', 'mongodb://localhost:27017/bankmanagement')
    }
    CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    MONGODB_SETTINGS = {
        'db': 'bankmanagement',
        'host': os.getenv('MONGODB_URI', 'mongodb://localhost:27017/bankmanagement')
    }
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://26-07bank.vercel.app')

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    MONGODB_SETTINGS = {
        'db': 'bankmanagement_test',
        'host': 'mongodb://localhost:27017/bankmanagement_test'
    }

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

## 2.3 Update Backend `.env`

```bash
cat > ~/workspace/backend/.env << 'EOF'
FLASK_ENV=production
FLASK_APP=run.py
MONGODB_URI=mongodb+srv://bankuser:bankpass123mongo@cluster0.xxxxx.mongodb.net/bankmanagement?retryWrites=true&w=majority
CORS_ORIGINS=https://26-07bank.vercel.app,http://localhost:3000
SECRET_KEY=your-secret-key-here-change-this
JWT_SECRET_KEY=your-jwt-secret-here-change-this
DEBUG=False
EOF
```

**⚠️ Replace:**
- `mongodb+srv://bankuser:bankpass123mongo@cluster0.xxxxx.mongodb.net/bankmanagement` with your MongoDB connection string
- `your-secret-key-here-change-this` with a random string

## 2.4 Update Backend Init File

Edit `backend/app/__init__.py`:

```python
"""
Flask application factory and initialization
"""
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mongoengine import MongoEngine
import os
import logging

# Initialize extensions
db = MongoEngine()
jwt = JWTManager()

def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    # Import config
    from config import config

    # Create app
    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config["default"]))

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # Configure CORS
    cors_origins = app.config.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})

    # Register blueprints
    _register_blueprints(app)

    # Setup logging
    _setup_logging(app)

    app.logger.info(f"Application initialized in {config_name} mode")
    return app

def _setup_logging(app):
    """Configure logging"""
    if not app.debug:
        if not os.path.exists('logs'):
            os.makedirs('logs')
        file_handler = logging.FileHandler('logs/banking_system.log')
        file_handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        app.logger.addHandler(file_handler)

def _register_blueprints(app):
    """Register API blueprints"""
    from app.routes.auth_secure import auth_bp
    app.register_blueprint(auth_bp)
```

## 2.5 Create `backend/requirements.txt`

```
Flask==2.3.3
Flask-JWT-Extended==4.5.2
Flask-CORS==4.0.0
Flask-MongoEngine==1.0.1
MongoEngine==0.27.0
pymongo==4.5.0
python-dotenv==1.0.0
bcrypt==4.0.1
```

Install:
```bash
cd ~/workspace/backend
pip install -r requirements.txt
```

---

# **STEP 3: Deploy to Render (10 minutes)**

## 3.1 Prepare for Deployment

```bash
cd ~/workspace && git add -A && git commit -m "migrate: Switch to MongoDB and Render deployment"
git push origin main
```

## 3.2 Create Render Account
1. Go to: https://render.com
2. Click **"Sign Up"**
3. Sign up with **GitHub** (easier for deployment)

## 3.3 Create Backend Service on Render

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitHub repository** (bankmanagement)
4. Fill in:
   - **Name:** `bankmanagement-api`
   - **Branch:** `main`
   - **Runtime:** `Python 3.11`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && gunicorn run:app`

5. **Environment Variables** (scroll down):
   - Add all variables from your `.env`:
     ```
     FLASK_ENV=production
     FLASK_APP=run.py
     MONGODB_URI=mongodb+srv://bankuser:bankpass123mongo@cluster0.xxxxx.mongodb.net/bankmanagement?retryWrites=true&w=majority
     CORS_ORIGINS=https://26-07bank.vercel.app,http://localhost:3000
     SECRET_KEY=your-secret-key
     JWT_SECRET_KEY=your-jwt-secret
     DEBUG=False
     ```

6. Click **"Create Web Service"**
7. **Wait 5-10 minutes** for deployment
8. Once deployed, you'll see a URL like: `https://bankmanagement-api-xxxxx.onrender.com`
9. **Copy this URL** - you'll need it! 📌

---

# **STEP 4: Update Vercel Frontend (5 minutes)**

## 4.1 Add Environment Variable

1. Go to: **https://vercel.com/dashboard**
2. Click your **bankmanagement** project
3. Go to **Settings** → **Environment Variables**
4. Update or add:
   ```
   REACT_APP_API_URL=https://bankmanagement-api-xxxxx.onrender.com/api
   ```
   (Replace with your actual Render URL)

5. Click **Save**
6. Vercel will **auto-redeploy** (wait 2-3 minutes)

---

# **STEP 5: Test Everything (5 minutes)**

## 5.1 Test Backend API

```bash
curl -X POST https://bankmanagement-api-xxxxx.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"shahinsha","password":"262007"}'
```

You should get a response with `access_token` ✅

## 5.2 Test Frontend Login

1. Open browser: **https://26-07bank.vercel.app**
2. Clear cache (Ctrl+Shift+Delete)
3. **Hard refresh** (Ctrl+F5)
4. Enter credentials:
   - **Username:** `shahinsha`
   - **Password:** `262007`
5. Click **Sign In**

You should see the **Admin Dashboard** ✅

---

# **Troubleshooting**

### **❌ "Cannot connect to MongoDB"**
- Check MongoDB URI in `.env`
- Verify IP whitelist in MongoDB Atlas (Network Access)
- Check database username/password

### **❌ "CORS Error"**
- Verify `CORS_ORIGINS` in Render environment variables
- Should include your Vercel URL: `https://26-07bank.vercel.app`

### **❌ "Login fails on Vercel but works locally"**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+F5)
- Check `REACT_APP_API_URL` in Vercel

### **❌ "Render deployment failed"**
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure `requirements.txt` includes all dependencies

---

# **URLs After Setup**

| Service | URL |
|---------|-----|
| **Frontend** | https://26-07bank.vercel.app |
| **Backend API** | https://bankmanagement-api-xxxxx.onrender.com |
| **MongoDB** | MongoDB Atlas Dashboard |
| **Render** | https://dashboard.render.com |

---

# **Important Files**

```
backend/
├── config.py          ← Database config (MongoDB)
├── requirements.txt   ← Python dependencies
├── .env              ← Environment variables (NEVER commit)
├── run.py            ← Entry point
└── app/
    └── __init__.py   ← Flask setup

frontend/
└── .env              ← React API URL
```

---

## ✅ **You're Done!**

Your banking system is now:
- ✅ Using MongoDB (cloud-hosted)
- ✅ Deployed on Render (free tier)
- ✅ Frontend on Vercel (already done)
- ✅ All HTTPS (secure)
- ✅ Completely free

**Start using it at:** https://26-07bank.vercel.app 🚀

---

## 📞 **Need Help?**

If something doesn't work:
1. Check Render logs (Dashboard → Logs)
2. Check MongoDB Atlas status
3. Verify environment variables match exactly
4. Clear browser cache and hard refresh

---

**Last Updated:** April 4, 2026
**Version:** MongoDB + Render Free Tier
