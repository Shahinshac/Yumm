# 🚀 Complete Google Sign-In Setup Guide for FoodHub Flutter + Web

This guide covers Google Sign-In integration for both **Flutter Mobile** and **Flutter Web** applications with backend support.

---

## 📋 TABLE OF CONTENTS
1. [Google Cloud Project Setup](#1-google-cloud-project-setup)
2. [Backend Configuration](#2-backend-configuration)
3. [Flutter Mobile (Android/iOS) Setup](#3-flutter-mobile-setup)
4. [Flutter Web Setup](#4-flutter-web-setup)
5. [Frontend Implementation](#5-frontend-implementation)
6. [Testing & Debugging](#6-testing--debugging)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Google Cloud Project Setup

### Step 1.1: Create Google Cloud Project

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Click the **Project** dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `FoodHub` (or your choice)
5. Click **CREATE**
6. Wait for project to be created
7. Select the new project from the dropdown

### Step 1.2: Enable Google Sign-In API

1. Go to **APIs & Services** → **Library**
2. Search for **Google+ API** (or **Identity Platform**)
3. Click on it
4. Click **ENABLE**
5. Wait for API to be enabled

### Step 1.3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth 2.0 Client ID**
4. You'll be asked to create a **consent screen** first:
   - Click **CONFIGURE CONSENT SCREEN**
   - Select **External** (for testing/development)
   - Click **CREATE**

### Step 1.4: Configure OAuth Consent Screen

**User Type:** External

**Fill Form:**
- App name: `FoodHub`
- User support email: `shaahnpvt7@gmail.com`
- Developer contact: `shaahnpvt7@gmail.com`
- Click **SAVE AND CONTINUE**

**Scopes:** (next page)
- Click **ADD OR REMOVE SCOPES**
- Search and add:
  - `email`
  - `profile`
  - `openid`
- Click **UPDATE**
- Click **SAVE AND CONTINUE**

**Test Users:** (optional for now, skip by clicking **SAVE AND CONTINUE**)

**Review:** Click **BACK TO DASHBOARD**

### Step 1.5: Create OAuth Credentials for Each Platform

You need to create credentials for:
- ✅ **Android**
- ✅ **iOS**
- ✅ **Web**

#### A. Get Android SHA-1 Certificate Fingerprint

First, generate your release and debug keystore SHA-1:

**Debug Keystore:**
```bash
# Windows
keytool -list -v -keystore "%APPDATA%\\.android\\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Release Keystore:**
```bash
# Find the path to your release keystore
# Then run (update path):
keytool -list -v -keystore "path/to/foodhub-release-key.jks" -alias foodhub -storepass <your-keystore-password> -keypass <your-key-password>

# Save the SHA-1 fingerprint
```

#### B. Create Android OAuth Credential

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Choose **Android**
4. Fill in:
   - **Package name**: `com.foodhub.yumm` (or your package name)
   - **SHA-1 certificate fingerprint**: Paste both debug AND release SHA-1s (add as separate entries)
5. Click **CREATE**
6. Note the **Client ID** (you'll need it for Android config)

#### C. Create iOS OAuth Credential

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Choose **iOS**
4. Fill in:
   - **Bundle ID**: `com.foodhub.yumm` (or your bundle ID - see pubspec.yaml)
   - **App Store ID**: Leave empty (for development)
   - **Team ID**: Optional
5. Click **CREATE**
6. Note your **Client ID**

#### D. Create Web OAuth Credential

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Choose **Web Application**
4. Fill in:
   - **Name**: `FoodHub Web`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost
     http://127.0.0.1
     https://yummfoodhub.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/callback
     http://localhost/callback
     http://127.0.0.1/callback
     https://yummfoodhub.vercel.app/callback
     ```
5. Click **CREATE**
6. Download the JSON file (required for web)
7. Copy **Client ID** and **Client Secret**

---

## 2. Backend Configuration

### Step 2.1: Update Backend Environment

Edit `backend/.env`:

```env
# Google Sign-In Configuration
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_FROM_STEP_1D
GOOGLE_WEB_CLIENT_SECRET=YOUR_WEB_CLIENT_SECRET_FROM_STEP_1D
GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID_FROM_STEP_1B
GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID_FROM_STEP_1C

# Your redirect URL
GOOGLE_OAUTH_REDIRECT_URL=https://yummfoodhub.vercel.app/auth/callback
```

### Step 2.2: Backend Already Supports Google Login ✅

The endpoint is ready:

```
POST /api/auth/google-login
```

**For Testing (Mock Token):**
```json
{
  "id_token": "mock_customer123"
}
```

**For Real Google Token:**
```json
{
  "id_token": "REAL_ID_TOKEN_FROM_GOOGLE"
}
```

**Response:**
```json
{
  "message": "Google login successful",
  "access_token": "JWT_TOKEN",
  "user": {
    "id": "...",
    "email": "user@gmail.com",
    "role": "customer",
    "is_approved": true
  }
}
```

---

## 3. Flutter Mobile Setup

### Step 3.1: Add Google Sign-In Packages

Edit `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  # ... existing dependencies
  google_sign_in: ^6.1.6
  firebase_core: ^2.20.0
  firebase_auth: ^4.10.0
  # Optional but recommended:
  sign_in_with_apple: ^5.0.0  # For iOS Apple sign-in
```

**Run:**
```bash
flutter pub get
```

### Step 3.2: Android Configuration

Edit `android/app/build.gradle`:

```gradle
android {
    compileSdk 34  // Update to latest

    defaultConfig {
        applicationId "com.foodhub.yumm"
        minSdkVersion 21
        targetSdkVersion 34
        // ... rest of config
    }
}

dependencies {
    // Already included by google_sign_in
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="FoodHub"
        android:icon="@mipmap/ic_launcher">

        <!-- Google Sign-In configuration -->
        <meta-data
            android:name="com.google.android.gms.version"
            android:value="@integer/google_play_services_version" />

        <!-- Add your Firebase web client ID (from web credential) -->
        <!-- Not needed for Android-specific cred, but helps with web login -->

        <!-- ... rest of app config -->
    </application>
</manifest>
```

### Step 3.3: iOS Configuration

Edit `ios/Podfile` (uncomment platform):

```ruby
platform :ios, '12.0'  # Minimum iOS 12
```

Edit `ios/Runner/Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- ... existing config ... -->

    <!-- Google Sign-In Configuration -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>com.googleusercontent.apps.YOUR_GOOGLE_CLIENT_ID</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>com.googleusercontent.apps.YOUR_GOOGLE_CLIENT_ID</string>
            </array>
        </dict>
    </array>

    <key>REVERSED_CLIENT_ID</key>
    <string>com.google.YOUR_GOOGLE_CLIENT_ID</string>

    <!-- ... rest of config ... -->
</dict>
</plist>
```

**Get your reversed client ID:**
- Example: If your Client ID is `123456.apps.googleusercontent.com`
- Reversed: `com.googleusercontent.apps.123456`

### Step 3.4: Generate GoogleService Configuration

Create `android/app/google-services.json`:

```json
{
  "project_info": {
    "project_number": "YOUR_PROJECT_NUMBER",
    "project_id": "your-project-id",
    "storage_bucket": "your-project.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:YOUR_PROJECT_NUMBER:android:SHA1_HASH",
        "android_client_info": {
          "package_name": "com.foodhub.yumm"
        }
      },
      "oauth_client": [
        {
          "client_id": "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.foodhub.yumm",
            "certificate_hash": "YOUR_SHA1_FINGERPRINT"
          }
        }
      ],
      "api_key": [
        {
          "current_key": "YOUR_API_KEY"
        }
      ]
    }
  ]
}
```

---

## 4. Flutter Web Setup

### Step 4.1: Add Dependencies

Already handled by `google_sign_in` package.

### Step 4.2: Update `web/index.html`

Add Google Sign-In script BEFORE `</head>`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>FoodHub - Food Delivery</title>
    <!-- ... existing meta tags ... -->

    <!-- Google Sign-In -->
    <meta name="google-signin-client_id" content="YOUR_WEB_CLIENT_ID.apps.googleusercontent.com">
    <script src="https://accounts.google.com/gsi/client" async defer></script>

    <!-- ... rest of head ... -->
</head>
<body>
    <div id="app"></div>
    <!-- ... rest of body ... -->
</body>
</html>
```

### Step 4.3: CORS Configuration for Backend

Backend is already configured. If testing locally:

Edit `backend/config.py`:

```python
CORS_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://yummfoodhub.vercel.app',
    'https://frontend-mobile-r3kuj88ah-shahinshacs-projects.vercel.app'
]
```

Render is already updated via environment variables.

---

## 5. Frontend Implementation

### Step 5.1: Create Google Sign-In Service

Create `lib/services/google_signin_service.dart`:

```dart
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;

class GoogleSignInService {
  late GoogleSignIn _googleSignIn;

  GoogleSignInService() {
    // Initialize with platform-specific client ID
    final clientId = _getClientId();

    _googleSignIn = GoogleSignIn(
      clientId: clientId,
      scopes: [
        'email',
        'profile',
        'openid',
      ],
    );
  }

  String _getClientId() {
    // Platform-specific client IDs
    if (kIsWeb) {
      return 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
    } else if (Platform.isAndroid) {
      return 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
    } else if (Platform.isIOS) {
      return 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
    }
    throw UnsupportedError('Unsupported platform');
  }

  /// Sign in with Google
  Future<GoogleSignInAccount?> signIn() async {
    try {
      final account = await _googleSignIn.signIn();
      return account;
    } catch (e) {
      print('Google Sign-In Error: $e');
      return null;
    }
  }

  /// Get ID token for backend
  Future<String?> getIdToken() async {
    try {
      final account = _googleSignIn.currentUser;
      if (account == null) {
        final signedInAccount = await signIn();
        if (signedInAccount == null) return null;
      }

      final authentication = await _googleSignIn.currentUser?.authentication;
      return authentication?.idToken;
    } catch (e) {
      print('Get ID Token Error: $e');
      return null;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (e) {
      print('Sign Out Error: $e');
    }
  }

  /// Disconnect
  Future<void> disconnect() async {
    try {
      await _googleSignIn.disconnect();
    } catch (e) {
      print('Disconnect Error: $e');
    }
  }

  /// Check if signed in
  bool isSignedIn() {
    return _googleSignIn.currentUser != null;
  }
}
```

### Step 5.2: Create Auth Service for Backend

Create `lib/services/auth_service.dart`:

```dart
import 'package:dio/dio.dart';
import 'google_signin_service.dart';
import '../models/user_model.dart';

class AuthService {
  final String baseUrl = 'https://yumm-ym2m.onrender.com';
  late Dio _dio;
  final googleSignIn = GoogleSignInService();

  AuthService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
      contentType: 'application/json',
    ));
  }

  /// Google Sign-In Login
  Future<Map<String, dynamic>> googleLogin() async {
    try {
      // Step 1: Sign in with Google
      final account = await googleSignIn.signIn();
      if (account == null) {
        throw Exception('Google Sign-In cancelled by user');
      }

      // Step 2: Get ID token
      final idToken = await googleSignIn.getIdToken();
      if (idToken == null) {
        throw Exception('Failed to get ID token from Google');
      }

      // Step 3: Send to backend
      final response = await _dio.post(
        '/api/auth/google-login',
        data: {
          'id_token': idToken,
        },
      );

      // Step 4: Return token and user
      return {
        'success': true,
        'access_token': response.data['access_token'],
        'user': response.data['user'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'error': e.response?.data['error'] ?? 'Login failed',
      };
    } catch (e) {
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  /// Email/Password Login (for restaurant/delivery after approval)
  Future<Map<String, dynamic>> emailLogin(String email, String password) async {
    try {
      final response = await _dio.post(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      return {
        'success': true,
        'access_token': response.data['access_token'],
        'user': response.data['user'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'error': e.response?.data['error'] ?? 'Login failed',
      };
    }
  }

  /// Set authorization header
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  /// Get current user
  Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final response = await _dio.get('/api/auth/me');
      return {
        'success': true,
        'user': response.data,
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'error': e.response?.data['error'] ?? 'Failed to fetch user',
      };
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await googleSignIn.signOut();
      _dio.options.headers.remove('Authorization');
    } catch (e) {
      print('Logout Error: $e');
    }
  }
}
```

### Step 5.3: Create Login Screen with Google Sign-In

Create `lib/screens/login_screen.dart`:

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../providers/auth_provider.dart';
import 'package:provider/provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final authService = AuthService();
  bool isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('FoodHub Login')),
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              Image.asset('assets/logo.png', width: 120, height: 120),
              SizedBox(height: 32),

              // Title
              Text(
                'Order Food Online',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              SizedBox(height: 8),
              Text(
                'Fast delivery to your doorstep',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              SizedBox(height: 48),

              // Google Sign-In Button
              ElevatedButton.icon(
                onPressed: isLoading ? null : ()=>_handleGoogleSignIn(context),
                icon: Image.asset('assets/google_logo.png', width: 24),
                label: Text('Sign in with Google'),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 56),
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: Colors.grey[300]!),
                  ),
                ),
              ),
              SizedBox(height: 16),

              // Email/Password Login
              ElevatedButton(
                onPressed: isLoading ? null : ()=>_showEmailLoginDialog(context),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 56),
                  backgroundColor: Colors.green,
                ),
                child: Text('Sign in with Email'),
              ),
              SizedBox(height: 24),

              // Register as Restaurant/Delivery
              TextButton(
                onPressed: ()=>_showRoleSelection(context),
                child: Text('Register as Restaurant or Delivery Partner'),
              ),

              if (isLoading)
                Padding(
                  padding: EdgeInsets.only(top: 24),
                  child: CircularProgressIndicator(),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleGoogleSignIn(BuildContext context) async {
    setState(() => isLoading = true);

    try {
      final result = await authService.googleLogin();

      if (result['success']) {
        // Save token
        authService.setAuthToken(result['access_token']);

        // Update provider
        if (mounted) {
          Provider.of<AuthProvider>(context, listen: false)
              .setUser(result['user'], result['access_token']);

          // Navigate to home
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } else {
        _showErrorSnackbar(context, result['error']);
      }
    } catch (e) {
      _showErrorSnackbar(context, 'An error occurred: $e');
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _showEmailLoginDialog(BuildContext context) {
    final emailController = TextEditingController();
    final passwordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Email Login'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: emailController,
              decoration: InputDecoration(hintText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 16),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(hintText: 'Password'),
              obscureText: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPress: ()=>Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: ()async {
              Navigator.pop(context);
              await _handleEmailLogin(context, emailController.text, passwordController.text);
            },
            child: Text('Login'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleEmailLogin(BuildContext context, String email, String password) async {
    setState(() => isLoading = true);

    try {
      final result = await authService.emailLogin(email, password);

      if (result['success']) {
        authService.setAuthToken(result['access_token']);

        if (mounted) {
          Provider.of<AuthProvider>(context, listen: false)
              .setUser(result['user'], result['access_token']);
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } else {
        _showErrorSnackbar(context, result['error']);
      }
    } catch (e) {
      _showErrorSnackbar(context, 'An error occurred: $e');
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _showRoleSelection(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Register As'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text('Restaurant'),
              onTap: ()=>Navigator.pop(context, 'restaurant'),
            ),
            ListTile(
              title: Text('Delivery Partner'),
              onTap: ()=>Navigator.pop(context, 'delivery'),
            ),
          ],
        ),
      ),
    ).then((role) {
      if (role != null) {
        Navigator.of(context).pushNamed('/register', arguments: {'role': role});
      }
    });
  }

  void _showErrorSnackbar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }
}
```

### Step 5.4: Add Google Sign-In Button Dependencies

Add to `pubspec.yaml`:

```yaml
dev_dependencies:
  # For Google logo asset
  cupertino_icons: ^1.0.6
```

---

## 6. Testing & Debugging

### Test with Mock Google ID Token (Development)

Send to backend:
```json
{
  "id_token": "mock_test_user_123"
}
```

### Test with Real Google Token (Production)

1. Google Sign-In returns `id_token`
2. Send to backend's `/api/auth/google-login`

### Debug Logs

Enable logs in `GoogleSignInService`:

```dart
// Add debug logging
Future<GoogleSignInAccount?> signIn() async {
  print('🔐 Starting Google Sign-In...');
  try {
    final account = await _googleSignIn.signIn();
    print('✅ Google Sign-In Success: ${account?.email}');
    return account;
  } catch (e) {
    print('❌ Google Sign-In Error: $e');
    return null;
  }
}
```

### Test Endpoints Manually

```bash
# Test Google Login
curl -X POST https://yumm-ym2m.onrender.com/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"id_token": "mock_test_user"}'

# Test Getting Current User
curl -X GET https://yumm-ym2m.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 7. Troubleshooting

### Issue: "Client ID mismatch"

**Solution:** Ensure your client ID matches the platform:
- Android: Use Android Client ID from Google Cloud Console
- iOS: Use iOS Client ID
- Web: Use Web Client ID

### Issue: "Sign-In cancelled"

**Solution:** User closed the sign-in dialog. Handle gracefully in UI.

### Issue: "Invalid origin for the client"

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit the Web Client ID
3. Add your frontend URL to **Authorized JavaScript origins**:
   ```
   https://yummfoodhub.vercel.app
   ```

### Issue: "CORS error"

**Solution:** Backend CORS already configured. If testing locally, update `backend/config.py`.

### Issue: "SHA-1 fingerprint mismatch"

**Solution:**
1. Get correct SHA-1:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore
   ```
2. Update in Google Cloud Console

### Issue: "ID token verification failed"

**Solution:**
- For mock tokens: Token must start with `mock_`
- For real tokens: Backend will verify with Google's servers

---

## 📦 Complete File Checklist

- ✅ `backend/.env` - Google credentials
- ✅ `pubspec.yaml` - google_sign_in dependency
- ✅ `android/app/build.gradle` - Google Play Services
- ✅ `android/app/AndroidManifest.xml` - Permissions
- ✅ `ios/Runner/Info.plist` - URL schemes
- ✅ `web/index.html` - Google Sign-In script
- ✅ `lib/services/google_signin_service.dart` - Google Sign-In logic
- ✅ `lib/services/auth_service.dart` - Backend integration
- ✅ `lib/screens/login_screen.dart` - UI

---

## 🚀 Quick Start

1. **Clone FoodHub:**
   ```bash
   git clone https://github.com/Shahinshac/Yumm.git
   cd Yumm
   ```

2. **Create Google Cloud Project** (follow steps 1.1-1.5 above)

3. **Update credentials:**
   - `backend/.env`
   - `lib/services/google_signin_service.dart`
   - `web/index.html`

4. **Install dependencies:**
   ```bash
   flutter pub get
   ```

5. **Run the app:**
   ```bash
   # Mobile
   flutter run

   # Web
   flutter run -d chrome
   ```

---

## 📞 Support

Need help?
- Backend API docs: See AUTHENTICATION_API_GUIDE.md
- Google Sign-In docs: https://developers.google.com/identity/gsi/web
- Flutter google_sign_in: https://pub.dev/packages/google_sign_in

---

**Last Updated:** 2026-04-07
**Version:** 1.0
**Status:** Production Ready ✅
