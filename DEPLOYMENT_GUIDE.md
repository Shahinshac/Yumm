# 🍕 FoodHub - Flutter App Deployment Guide

Complete guide for deploying the FoodHub mobile app and backend API.

## 📋 Project Structure

```
foodhub/
├── backend/                 (Flask API - Render/Heroku)
└── frontend-mobile/         (Flutter App - Play Store/TestFlight)
```

---

## 🚀 QUICK DEPLOYMENT CHECKLIST

- [ ] Backend running locally, all endpoints tested
- [ ] MongoDB Atlas cluster created and connected
- [ ] Flutter app built and tested on emulator
- [ ] App icon and branding finalized
- [ ] Push to GitHub
- [ ] Deploy backend to Render
- [ ] Build release APK
- [ ] Upload to Google Play Store (or distribute via GitHub)

---

## 🖥️ PART 1: BACKEND DEPLOYMENT (Flask)

### Prerequisites
- GitHub account
- Render account (render.com)
- MongoDB Atlas account (mongodb.com)
- Python 3.8+

### Step 1: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a cluster:
   - Shared deployment (free)
   - Cloud provider: AWS
   - Region: closest to you
4. Create a database user:
   - Username: `foodhub_user`
   - Password: Generate strong password
5. Get connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy string: `mongodb+srv://user:pass@cluster.mongodb.net/fooddelivery`

### Step 2: Deploy Backend to Render

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Production ready backend and Flutter app"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to https://render.com
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Select `backend` as the root directory (if needed)

3. **Configure Render**
   - **Name:** `foodhub-backend`
   - **Environment:** Python 3
   - **Build Command:**
     ```
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start Command:**
     ```
     gunicorn --workers 4 --bind 0.0.0.0:5000 "backend.app:create_app()"
     ```

4. **Environment Variables**
   ```
   FLASK_ENV=production
   MONGODB_URI=mongodb+srv://foodhub_user:password@cluster.mongodb.net/fooddelivery?retryWrites=true&w=majority
   SECRET_KEY=your-long-random-string-here
   JWT_SECRET_KEY=another-long-random-string-here
   CORS_ORIGINS=http://localhost:5000,https://yourdomain.com
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Backend URL: `https://foodhub-backend.onrender.com`

### Step 3: Test Backend

```bash
# Check if API is running
curl https://foodhub-backend.onrender.com/api/restaurants

# Expected response: List of restaurants (or empty array)
```

### Render Free Tier Details
- ✅ Free tier available
- ✅ 750 hours/month free
- ⚠️ Spins down after 15 minutes inactivity
- 💡 Upgrade to Starter ($7/month) for always-on

---

## 📱 PART 2: FLUTTER APP BUILD & DEPLOYMENT

### Prerequisites
- Flutter SDK installed (`flutter --version`)
- Android Studio with Android SDK
- Run `flutter doctor` to verify setup
- GitHub account (for signing)

### Step 1: Configure API Endpoint

Edit `frontend-mobile/lib/services/api_service.dart` (or wherever API URL is set):

```dart
// For development
static const String baseUrl = 'http://localhost:5000/api';

// For production
static const String baseUrl = 'https://foodhub-backend.onrender.com/api';
```

### Step 2: Update App Branding

**File:** `frontend-mobile/pubspec.yaml`

```yaml
name: foodhub
description: FoodHub - Food Delivery App
publish_to: 'none'
version: 1.0.0+1

# Update app name, icon, and splash screen
```

**Android Branding:**
- App name: `android/app/src/main/AndroidManifest.xml`
- App icon: `android/app/src/main/res/mipmap-*/ic_launcher.png`

**iOS Branding:**
- App name: `ios/Runner/Info.plist`
- App icon: `ios/Runner/Assets.xcassets/`

### Step 3: Build Release APK

```bash
cd frontend-mobile

# Clean previous builds
flutter clean

# Get dependencies
flutter pub get

# Build APK (release version)
flutter build apk --release

# OR build App Bundle (for Play Store)
flutter build appbundle --release
```

**Output locations:**
- APK: `build/app/outputs/flutter-app.apk`
- App Bundle: `build/app/outputs/app-release.aab`

**File sizes:**
- APK: ~50-70 MB
- App Bundle: ~40-60 MB

### Step 4: Test APK

```bash
# Install on connected device
flutter install build/app/outputs/flutter-app.apk

# Or transfer file manually and install via:
adb install build/app/outputs/flutter-app.apk
```

---

## 📲 PART 3: GOOGLE PLAY STORE DEPLOYMENT

### Prerequisites
- Google Play Developer account ($25 one-time fee)
- Android app signing key
- APK or App Bundle built

### Step 1: Create App Signing Key

```bash
keytool -genkey -v -keystore ~/foodhub-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias foodhub

# When prompted, remember the password
```

### Step 2: Sign APK

Create `android/key.properties`:
```
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=foodhub
storeFile=/path/to/foodhub-key.jks
```

Then build signed APK:
```bash
flutter build apk --release
```

### Step 3: Upload to Play Store

1. Go to https://play.google.com/console
2. Create new app
3. Fill in app details:
   - App name: FoodHub
   - Default language: English
   - App or game: App
4. Accept declaration
5. Go to "Release" → "Production"
6. Create release:
   - Upload APK/App Bundle
   - Release notes: "Initial release"
   - Review and publish

### Step 4: Monitor Deployment

- Publishing takes 2-3 hours
- Check Play Store for status updates
- Share link with users

---

## 🍎 PART 4: APP STORE DEPLOYMENT (iOS)

### Prerequisites
- Apple Developer account ($99/year)
- Mac computer
- Xcode installed

### Step 1: Configure Xcode

```bash
cd frontend-mobile/ios
pod install
open Runner.xcworkspace
```

Configure in Xcode:
- Bundle identifier: `com.example.foodhub`
- Version: `1.0.0`
- Build: `1`

### Step 2: Build for iOS

```bash
cd frontend-mobile
flutter build ios --release
```

### Step 3: Upload to App Store

1. Use Xcode to archive and upload
2. Or use Transporter app from Apple
3. Fill in TestFlight details
4. Submit for review

---

## 📦 ALTERNATIVE: DIRECT APK DISTRIBUTION

If you don't want to use Play Store:

### Option 1: GitHub Releases

1. Go to GitHub repository
2. Create a Release
3. Upload APK file
4. Share download link

### Option 2: Firebase App Distribution

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Distribute APK
firebase appdistribution:distribute build/app/outputs/flutter-app.apk \
  --app=YOUR_APP_ID \
  --release-notes="Initial release" \
  --testers="user@example.com"
```

### Option 3: Direct File Hosting

- Google Drive, Dropbox, or personal server
- Share download link with users
- Users manually install via `adb install apk-file`

---

## ✅ PRODUCTION CHECKLIST

### Backend
- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] Logging working (`curl /api/restaurants`)
- [ ] Error handling tested
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] HTTPS working (auto on Render)

### Mobile App
- [ ] API endpoint configured for production
- [ ] App icon finalized
- [ ] Branding updated
- [ ] APK built and tested
- [ ] App signed with production key
- [ ] Version number updated
- [ ] Minimum SDK version set
- [ ] Permissions reviewed

### Monitoring
- [ ] Backend logs setup
- [ ] Error tracking enabled
- [ ] User feedback mechanism
- [ ] Crash reporting configured
- [ ] Performance monitoring active

---

## 🔗 DEPLOYMENT URLS

### Development (Local)
```
Backend:  http://localhost:5000
Database: mongodb://localhost:27017/fooddelivery
```

### Staging (if needed)
```
Backend:  https://foodhub-backend-staging.onrender.com
Database: MongoDB Atlas (test cluster)
```

### Production
```
Backend:  https://foodhub-backend.onrender.com
Database: MongoDB Atlas (production cluster)
App:      Google Play Store
```

---

## 📈 SCALING CONSIDERATIONS

### When traffic increases:
1. **Render:** Upgrade to paid plan for always-on
2. **MongoDB:** Upgrade cluster size
3. **API:** Add caching (Redis)
4. **Images:** Use CDN (CloudFront, Firebase Storage)
5. **Notifications:** Setup Push Notifications (Firebase)

### Performance improvements:
- API request caching
- Database query optimization
- Image compression
- Lazy loading
- Code splitting
- Minification

---

## 🐛 TROUBLESHOOTING DEPLOYMENT

### Backend won't start on Render
- Check build command runs locally
- Verify Python version 3.8+
- Check all environment variables set
- View Render logs: `render.com/overview`

### Flutter APK issues
- Run `flutter doctor` to check setup
- Clear build: `flutter clean`
- Rebuild: `flutter pub get && flutter build apk --release`
- Check Android SDK version compatibility

### MongoDB connection issues
- Verify connection string format
- Check IP whitelist on MongoDB Atlas
- Test locally first: `python run.py`
- Check MONGODB_URI env variable

### App won't connect to API
- Verify API URL in app code
- Check backend is running: `curl https://backend-url/api/restaurants`
- Check CORS configuration
- Verify network request in app logs

---

## 📚 Useful Resources

- **Flutter Build:** https://flutter.dev/docs/deployment
- **Google Play Console:** https://play.google.com/console
- **Apple App Store:** https://appstoreconnect.apple.com
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://docs.mongodb.com/atlas
- **Firebase Distribution:** https://firebase.google.com/docs/app-distribution

---

## 🎉 You're Done!

Your app is now deployed and ready for users! 🚀

- Backend API: Live and scalable
- Mobile app: Available on Play Store / Direct download
- Database: Secure and backed up
- Monitoring: In place

**Next steps:**
- Monitor user feedback
- Track analytics
- Plan new features
- Scale infrastructure as needed

---

**Time to celebrate your production deployment!** 🎊
