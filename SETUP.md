# FoodHub - Complete Setup & Deployment Guide

Complete guide for setting up FoodHub locally and deploying to production.

---

## 📋 Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Backend Setup](#backend-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [MongoDB Configuration](#mongodb-configuration)
5. [Running Locally](#running-locally)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python run.py
# Server: http://localhost:5000
```

### Mobile App
```bash
cd frontend-mobile
flutter pub get
flutter run
# On emulator/device
```

✅ Done! Backend running on port 5000, app on emulator/device.

---

## 🖥️ Backend Setup

### Prerequisites
- Python 3.8+
- pip
- MongoDB (local or Atlas)

### Step 1: Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate (choose one):
source venv/bin/activate              # macOS/Linux
venv\Scripts\activate                 # Windows CMD
venv\Scripts\activate.ps1             # Windows PowerShell
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment
```bash
cp .env.example .env
```

**For Local Development:**
```
FLASK_ENV=development
MONGODB_URI=mongodb://localhost:27017/fooddelivery
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-key
LOG_LEVEL=INFO
```

**For Production:**
```
FLASK_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/fooddelivery
SECRET_KEY=your-long-random-secret-key-here
JWT_SECRET_KEY=your-long-random-jwt-key-here
CORS_ORIGINS=https://yourdomain.com
LOG_LEVEL=WARNING
```

### Step 4: Verify Installation
```bash
python -c "from backend.app import create_app; app = create_app(); print('✅ Backend initialized!')"
```

### Step 5: Run Backend
```bash
python run.py
```

**Expected Output:**
```
✅ MongoDB connected successfully
✅ CORS configured
✅ JWT configured
✅ All blueprints registered successfully
✅ FoodHub App initialized successfully!
```

Backend running at: `http://localhost:5000`

---

## 📱 Mobile App Setup

### Prerequisites
- Flutter SDK (https://flutter.dev/docs/get-started/install)
- Android Studio or Xcode
- Emulator or physical device

### Step 1: Verify Flutter Installation
```bash
flutter --version
flutter doctor
```

Should see: ✓ Flutter, ✓ Android toolchain (or Xcode)

### Step 2: Get Dependencies
```bash
cd frontend-mobile
flutter pub get
```

### Step 3: Configure API Endpoint

Edit `frontend-mobile/lib/services/api_service.dart`:
```dart
// Development
static const String baseUrl = 'http://localhost:5000/api';

// Production
static const String baseUrl = 'https://your-backend-url/api';
```

### Step 4: Run App

**On Android Emulator:**
```bash
flutter run
```

**On Physical Device:**
```bash
flutter devices          # List connected devices
flutter run -d <device-id>
```

**On iOS Simulator (macOS):**
```bash
open -a Simulator
flutter run
```

---

## 🗄️ MongoDB Configuration

### Option A: Local MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Run installer
3. MongoDB Server auto-starts

**Linux:**
```bash
sudo apt-get install -y mongodb
sudo service mongod start
```

**In .env:**
```
MONGODB_URI=mongodb://localhost:27017/fooddelivery
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create "Shared" cluster
4. Create database user: `foodhub_user`
5. Get connection string: `mongodb+srv://foodhub_user:PASSWORD@cluster.mongodb.net/fooddelivery`
6. Add IP to whitelist (Network Access)

**In .env:**
```
MONGODB_URI=mongodb+srv://foodhub_user:PASSWORD@cluster.mongodb.net/fooddelivery
```

---

## 🏃 Running Locally

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
python run.py
# Listening on http://localhost:5000
```

### Terminal 2 - Mobile App
```bash
cd frontend-mobile
flutter run
# Running on emulator/device
```

### Test the Setup

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Get Restaurants:**
```bash
curl http://localhost:5000/api/restaurants
```

---

## 🚀 Production Deployment

### Backend (Render)

1. Push to GitHub:
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. Go to https://render.com
3. New → Web Service
4. Connect GitHub repository
5. Configure:
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn --workers 4 --bind 0.0.0.0:5000 "backend.app:create_app()"`
6. Add environment variables:
   - FLASK_ENV=production
   - MONGODB_URI=your-atlas-uri
   - SECRET_KEY=random-key
   - JWT_SECRET_KEY=random-key
7. Deploy

**Backend URL:** `https://foodhub-backend.onrender.com`

### Mobile App (Google Play)

1. Build APK:
```bash
cd frontend-mobile
flutter build apk --release
```

2. Google Play Store:
   - Go to https://play.google.com/console
   - Create app
   - Upload APK
   - Set release notes
   - Publish (2-3 hours to appear)

3. Or direct distribution:
   - GitHub Releases (free)
   - Firebase Distribution
   - Direct link

---

## ✅ Verification Checklist

- [ ] MongoDB running (local or Atlas)
- [ ] Backend dependencies installed
- [ ] .env configured
- [ ] Backend starts: `python run.py`
- [ ] API responds: `curl http://localhost:5000/api/restaurants`
- [ ] Flutter app runs: `flutter run`
- [ ] Login works with demo credentials

---

## 🐛 Troubleshooting

### Backend

**MongoDB connection failed**
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check IP whitelist (for Atlas)

**Module not found**
- Activate venv: `source venv/bin/activate`
- Reinstall: `pip install -r requirements.txt`

**Port 5000 in use**
- Change port in .env: `PORT=5001`

### Mobile App

**Connection refused**
- Backend must be running
- Check API endpoint in code
- Emulator: use `10.0.2.2:5000`

**Build failed**
```bash
flutter clean
flutter pub get
flutter run
```

---

## 📱 Demo Credentials

```
Admin:       admin / admin123
Customer:    customer / customer123
Restaurant:  restaurant / rest123
Delivery:    delivery / delivery123
```

---

## 🔗 Useful Links

- Flutter: https://flutter.dev/docs
- MongoDB: https://docs.mongodb.com
- Flask: https://flask.palletsprojects.com
- Render: https://render.com/docs

---

**Ready to deploy?** Follow the Production Deployment section above! 🚀
