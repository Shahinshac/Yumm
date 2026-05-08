# NexFood Mobile - Android App Guide

Your platform is now ready to be a native Android app! We use **Capacitor** to bridge the web and mobile worlds.

## 📱 How to Build the Android App (FREE)

### 1. Prerequisites
- **Android Studio**: Download and install it to compile the app.
- **Java JDK 17+**: Required for Android builds.

### 2. Synchronization
Every time you change the frontend, run:
```bash
npm run mobile:sync
```
This builds the React app and copies it into the Android project.

### 3. Open in Android Studio
To see your app code and run it on an emulator:
```bash
npm run mobile:open
```

### 4. Build APK (The App File)
To generate the `.apk` file that you can install on any phone:
1. Open Android Studio.
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Android Studio will generate the file in `android/app/build/outputs/apk/debug/`.

## 🌐 Backend Architecture
- **API Layer**: We have added `src/services/api.ts` which abstracts all database calls.
- **Vercel API**: The `/api` directory is ready for serverless functions (Node.js).
- **Future Growth**: You can swap the mock logic in `api.ts` for **Firebase** or **Supabase** in 5 minutes.

## ✨ Features Added for Mobile
- **Capacitor Config**: Setup for `com.nexfood.app`.
- **Responsive Layouts**: Optimized for the tall aspect ratios of modern smartphones.
- **Touch-Friendly UI**: Increased tap targets and glassmorphism optimized for mobile GPUs.
