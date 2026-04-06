# 🍕 FoodHub - Web + Mobile (APK) Deployment Guide

## 📋 Project Structure

```
foodhub-app/
├── backend/                 (Flask API - Render)
├── frontend/                (React Web - Vercel)
└── frontend-mobile/         (Flutter Mobile - Build APK)
```

---

## 🖥️ PART 1: WEB DEPLOYMENT (React)

### **Current Status:** ✅ READY

Your React web app is production-ready!

### **Step 1: Push to GitHub**

```bash
git add .
git commit -m "Add Flutter mobile app"
git push origin main
```

### **Step 2: Deploy Backend (Flask) to Render**

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `python backend/run.py`
6. **Environment Variables:**
   ```
   MONGODB_URI=your_mongodb_connection_string
   FLASK_ENV=production
   ```
7. Deploy! API will be at: `https://bankmanagement-api.onrender.com`

**Live Backend URL:** https://bankmanagement-api.onrender.com

### **Step 3: Deploy Frontend (React) to Vercel**

1. Go to https://vercel.com
2. Import Repository
3. **Framework:** React
4. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://bankmanagement-api.onrender.com/api
   ```
5. Deploy! App will be at: `https://foodhub-app.vercel.app` (custom domain available)

**Live Frontend URL:** https://26-07bank.vercel.app

---

## 📱 PART 2: ANDROID APK DEPLOYMENT (Flutter)

### **Current Status:** ✅ READY TO BUILD

### **Prerequisites**

1. **Flutter SDK Installed**
   ```bash
   flutter --version
   ```
   If not installed: https://flutter.dev/docs/get-started/install

2. **Android SDK** (comes with Android Studio)
   ```bash
   flutter doctor
   ```

### **Step 1: Configure API URL**

Edit `frontend-mobile/lib/services/api_service.dart`:

```dart
// For local testing:
static const String baseUrl = 'http://localhost:5000/api';

// For production (deployed backend):
static const String baseUrl = 'https://bankmanagement-api.onrender.com/api';
```

### **Step 2: Build APK**

```bash
cd frontend-mobile
flutter pub get
flutter build apk --release
```

**Output:** `frontend-mobile/build/app/outputs/flutter-app.apk`

**File Size:** ~50-70 MB

**Build Time:** 5-15 minutes

### **Step 3: Option A - FREE Distribution (GitHub Releases)** ⭐

#### **Upload APK to GitHub Releases**

```bash
cd ..
git add frontend-mobile/build/app/outputs/flutter-app.apk
git commit -m "Add FoodHub Android APK v1.0"
git tag -a v1.0 -m "FoodHub Android Release v1.0"
git push origin main --tags
```

Then on GitHub:
1. Go to Releases → Draft a new Release
2. Attach `flutter-app.apk`
3. Publish!

**Share Link:** `https://github.com/Shahinshac/bankmanagement/releases/download/v1.0/flutter-app.apk`

**Users Download:** Click link → Download APK → Install on phone

#### **Requirements to Install:**
- Android 5.0+ (API 21+)
- ~100 MB storage space
- "Unknown sources" enabled in settings

---

### **Step 4: Option B - Google Play Store** (~$25 one-time)

#### **1. Create Google Play Account**
- Go to https://play.google.com/console
- Pay $25 registration fee (one-time)
- Create app

#### **2. Generate Signing Key**

```bash
cd frontend-mobile/android/app
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias flutter-app
```

#### **3. Sign APK**

Add to `frontend-mobile/android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        keyAlias = 'flutter-app'
        keyPassword = 'YOUR_PASSWORD'
        storeFile = file('release-key.jks')
        storePassword = 'YOUR_PASSWORD'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

#### **4. Build Signed APK**

```bash
flutter build apk --release
```

#### **5. Upload to Play Store**
- Google Play Console → Upload APK
- Fill app details, pricing, etc.
- Wait for review (24-48 hours)
- Live on Play Store!

**Users Download:** Search "FoodHub" on Play Store → Install

---

### **Step 5: Option C - Firebase App Distribution** (BEST FOR BETA)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Distribute APK
firebase appdistribution:distribute frontend-mobile/build/app/outputs/flutter-app.apk \
  --app 1:123456789:android:abcdef123456 \
  --release-notes "Version 1.0" \
  --testers "user@example.com"
```

**Users:** Get email → Click link → Install

---

## 🚀 DEPLOYMENT CHECKLIST

### **Before Building APK**

- [ ] Update API base URL in `api_service.dart`
- [ ] Test on Android emulator or device
- [ ] Verify all endpoints work
- [ ] Update app version in `pubspec.yaml`
- [ ] Update `AndroidManifest.xml` permissions

### **Before Deploying to Play Store**

- [ ] Create beautiful app icon (512x512px)
- [ ] Take 5-6 app screenshots for Play Store
- [ ] Write compelling app description
- [ ] Add release notes
- [ ] Generate signing key and keep it safe
- [ ] Test signed APK on real device

### **Before Going Live**

- [ ] Backend API running (Render)
- [ ] Frontend working (Vercel)
- [ ] Mobile APK tested on multiple devices
- [ ] Privacy policy written
- [ ] Terms of service written

---

## 📊 THREE DEPLOYMENT STRATEGIES

| Method | Cost | Users | Time | Setup |
|--------|------|-------|------|-------|
| **GitHub Releases** | $0 | Tech-savvy | 5 min | Easy |
| **Firebase Distribution** | $0 | Beta testers | 10 min | Medium |
| **Google Play Store** | $25 | Everyone | 48+ hrs | Medium |

**Recommended Path:**
1. **Start:** GitHub Releases (free, easy)
2. **Test:** Firebase Distribution (invite testers)
3. **Scale:** Google Play Store (100k+ downloads)

---

## 🎯 QUICK START (TODAY)

### **Web (5 minutes)**
```bash
git push origin main
# Deployed to Vercel automatically
```

### **Mobile APK (15 minutes)**
```bash
cd frontend-mobile
flutter build apk --release
# APK ready at: build/app/outputs/flutter-app.apk
```

Then upload to GitHub Releases!

---

## 📲 TESTING BEFORE RELEASE

### **Test Locally on Emulator**

```bash
flutter emulators --launch Pixel_5_API_30
flutter run -r
```

### **Test on Real Device**

```bash
# Connect Android phone via USB
flutter devices
flutter run --release
```

### **What to Test**

- [ ] Login/Register works
- [ ] Can browse restaurants
- [ ] Add items to cart
- [ ] Checkout process works
- [ ] Promo codes apply
- [ ] Order placed successfully
- [ ] Can track order
- [ ] Can submit review
- [ ] All other user roles work

---

## 🔗 IMPORTANT LINKS

| Service | URL | Purpose |
|---------|-----|---------|
| **GitHub** | https://github.com/Shahinshac/bankmanagement | Code repo + APK releases |
| **Render** | https://render.com | Backend API hosting |
| **Vercel** | https://vercel.com | Frontend web hosting |
| **Google Play** | https://play.google.com/console | Android app store |
| **Firebase** | https://console.firebase.google.com | Beta distribution |

---

## 💡 TIPS FOR SUCCESS

1. **Start with GitHub Releases** - Simplest, freest option
2. **Share APK link** - Users can install directly
3. **Get 1000+ users** → Then pay $25 for Play Store
4. **Keep signing key safe** - Used for all future updates
5. **Increment version** - Each release needs higher version number

---

## 📞 SUPPORT

**Issue:** APK won't install
- Solution: Check Android version (need 5.0+), enable "Unknown sources" in settings

**Issue:** App crashes on startup
- Solution: Check internet connection, verify API_URL in code, check backend is running

**Issue:** Login doesn't work
- Solution: Verify backend API is responding, check demo credentials

**Issue:** Can't build APK
- Solution: Run `flutter doctor` to fix issues, ensure Android SDK is installed

---

## ✨ NEXT FEATURES TO ADD

**After Launch:**
- Push notifications
- Real-time WebSocket updates
- In-app payment gateway
- User ratings/reviews refine
- Restaurant dashboard completion
- Delivery tracking with map
- Chat support

---

**Status: READY FOR PRODUCTION** ✅

Both Web App and Android APK ready to deploy!

🎉 You now have a full-stack food delivery app!
