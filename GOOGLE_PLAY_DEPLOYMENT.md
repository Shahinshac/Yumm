# 🚀 Google Play Store Deployment Guide

## Complete Step-by-Step Guide to Launch FoodHub APK

---

## 📋 Pre-Deployment Checklist

### ✅ What You Have Ready
- ✅ Signed APK: `frontend-mobile/build/app/outputs/flutter-apk/app-release.apk` (49.9 MB)
- ✅ Signing Key: `android_keystore/foodhub-release-key.jks`
- ✅ Backend API: https://yumm-ym2m.onrender.com ✅ LIVE
- ✅ Web App: https://frontend-mobile-hymti8ny3-shahinshacs-projects.vercel.app ✅ LIVE

### ✅ What You Need
- [ ] Google Play Developer Account ($25 one-time fee)
- [ ] App icon (512x512 PNG image)
- [ ] 2-5 screenshots (minimum 2, recommended 5)
- [ ] App description (80 characters)
- [ ] Privacy policy URL (required)
- [ ] Email address
- [ ] Payment method (credit/debit card)

---

## 🔐 Step 1: Create Google Play Developer Account

### 1.1 Visit Google Play Console
```
👉 Go to: https://play.google.com/console
```

### 1.2 Sign In with Google Account
- Click **"Sign in"**
- Use your Gmail/Google account
- If you don't have one, create at accounts.google.com

### 1.3 Create Developer Account
1. Accept Google Play Developer Agreement
2. Enter your name
3. Choose your country/region
4. Pay registration fee: **$25 USD** (one-time)
5. Provide payment method (credit/debit card)

> ℹ️ **Note:** Payment is processed instantly. Google Play Developer account is active immediately after payment.

---

## 📱 Step 2: Create New App

### 2.1 In Google Play Console
Click **"Create app"** button (top right)

### 2.2 Fill in App Details

| Field | Value |
|-------|-------|
| App name | **FoodHub** |
| Default language | **English** |
| App type | **Application** |
| Category | **Food & Drink** |
| Is free? | **Yes** (or select pricing) |

### 2.3 Accept Declarations
- ✅ Check all the declaration boxes
- Click **"Create app"**

> ✅ Your app is now created in draft status

---

## 🎨 Step 3: App Details & Branding

### 3.1 Add App Icon
1. Go to **"App details"** section
2. Scroll to **"App icon"**
3. Upload 512x512 PNG image
4. Click **Save**

> 💡 **Tip:** Create a professional icon. Download free icon maker from Canva (canva.com)

### 3.2 Add Featured Graphic
1. Scroll to **"Featured graphic"**
2. Upload 1024x500 PNG image
3. Click **Save**

### 3.3 Add App Description
1. Scroll to **"Short description"**
2. Enter (max 80 characters):
   ```
   Order food from your favorite restaurants - delivered fast!
   ```
3. Scroll to **"Full description"**
4. Enter (max 4000 characters):
   ```
   🚀 FoodHub - Your Favorite Food, Delivered Fast!

   ✨ Features:
   ✅ Browse 100+ restaurants
   ✅ Order your favorite food
   ✅ Real-time order tracking
   ✅ Secure payment processing
   ✅ Rate & review restaurants
   ✅ Track delivery in real-time
   ✅ Get promo codes & discounts

   🎯 How it works:
   1. Sign up in 30 seconds
   2. Search restaurants near you
   3. Browse menus
   4. Place your order
   5. Track delivery live
   6. Enjoy your food!

   📱 Available on Android

   🔒 Your data is secure with us.

   Questions? Contact us at support@foodhub.com
   ```
5. Click **Save**

---

## 📸 Step 4: Add Screenshots

### 4.1 Upload Screenshots
1. Go to **"Screenshots"** section
2. Choose **"Phones"** (portrait 1080x1920)
3. Click **"Add screenshots"**
4. Upload 2-5 screenshots (recommended 5)

### 4.2 Screenshot Requirements
- **Format:** PNG or JPG
- **Dimensions:** 1080 x 1920 pixels
- **Minimum:** 2 screenshots
- **Recommended:** 5 screenshots

### 4.3 Create Screenshots
**Option A: From your device**
1. Test the APK on an Android phone
2. Use phone's screenshot tool (Power + Volume Down)
3. Save all 5 key screens:
   - Login screen
   - Restaurant listing
   - Menu screen
   - Order checkout
   - Order tracking

**Option B: Using Android Emulator** (if no phone)
```bash
flutter emulators --launch <emulator-name>
flutter run
# Take screenshots with Emulator screenshot tool
```

**Option C: Quick mock-ups** (temporary)
- Use Figma or Canva to create representative screenshots
- Website: canva.com

---

## 🔐 Step 5: Content Rating Questionnaire

### 5.1 Complete Questionnaire
1. Go to **"Content rating"**
2. Fill out questionnaire:
   - Target audience? **Teen (13+)**
   - Violence? **No**
   - Sexual content? **No**
   - Profanity? **No**
   - Alcohol/tobacco? **No**
3. Click **"Save"**

> ✅ Rating: **Everyone 3+** (Recommended for FoodHub)

---

## 📋 Step 6: Privacy Policy

### 6.1 Add Privacy Policy URL
1. Go to **"App content"** → **"App details"**
2. Scroll to **"Privacy policy"**
3. Enter your privacy policy URL:
   ```
   https://frontend-mobile-hymti8ny3-shahinshacs-projects.vercel.app/privacy
   ```

> 🔗 **Or use free generator:** https://www.termly.io/products/privacy-policy-generator/

### 6.2 Create Privacy Policy (Free)
1. Visit: https://www.termly.io/products/privacy-policy-generator/
2. Answer questions about your app
3. Generate and copy policy text
4. Host on your website or Vercel
5. Paste URL in Google Play Console

---

## 🚀 Step 7: Upload APK

### 7.1 Navigate to Release Section
1. Go to **"Testing"** → **"Internal testing"**
2. Click **"Create new release"**

### 7.2 Upload APK File
1. Click **"Upload"** button
2. Select APK from your computer:
   ```
   c:\Users\Shahinsha\.vscode\Yumm\Yumm\frontend-mobile\build\app\outputs\flutter-apk\app-release.apk
   ```
3. Wait for upload to complete (shows ✅)
4. Add **Release notes**:
   ```
   🎉 FoodHub v1.0.0 Launched!

   ✨ Features:
   - Browse restaurants
   - Place orders
   - Real-time tracking
   - Rate restaurants
   ```

### 7.3 Review Release
- **Game Data Required?** No
- **Data Safety?** Fill in (see next step)
- Click **"Save"** → **"Review release"**

---

## 🔒 Step 8: Data Safety & Permissions

### 8.1 Complete Data Safety Questionnaire
1. Go to **"App content"** → **"Data safety"**
2. Answer questions:

**Does your app collect or share personal data?**
- ✅ Yes (user profiles, orders)

**What data is collected?**
- ✅ User email
- ✅ Payment information (if applicable)
- ✅ Location data (for delivery)
- ✅ Order history

**Is data encrypted in transit?**
- ✅ Yes (HTTPS/TLS)

**Do you allow deletion?**
- ✅ Yes

**Is data shared with third parties?**
- ✅ No (unless for delivery partners)

3. Click **Save**

### 8.2 Permissions Declaration
- Review app permissions (automatic)
- Verify location, contacts, storage permissions
- Click **"Show more details"**
- Confirm all permissions are necessary
- Click **Save**

---

## ✅ Step 9: Production Rollout

### 9.1 Approve Release
1. Go to **"Testing"** → **"Internal testing"**
2. Select your release
3. Click **"Create production release"**
4. Review details:
   - APK version ✅
   - Release notes ✅
   - Screenshots ✅
   - Privacy policy ✅
   - Content rating ✅

### 9.2 Submit for Review
1. Click **"Review release"**
2. Verify all green checkmarks (✅)
3. Click **"Rollout to Production"**
4. Set rollout percentage:
   - **First time:** 10% (test with few users)
   - **After verification:** 100% (full rollout)
5. Click **"Confirm release"**

> ⏳ **Wait for review:** Google Play review team (24-48 hours)

---

## ⏱️ Step 10: Monitor Review Status

### 10.1 Check Status
1. Go to **"Release"** → **"Production"**
2. Status shows:
   - 🔵 **In review** = Being reviewed
   - 🟢 **Live** = Approved and available
   - 🔴 **Rejected** = Needs changes

### 10.2 If Rejected
1. Check rejection reason (email from Google)
2. Make required changes
3. Build new APK version (bump version in pubspec.yaml)
4. Upload new APK
5. Resubmit

### 10.3 After Approval
- 🎉 Your app is **LIVE on Google Play Store**!
- Share your store link: `https://play.google.com/store/apps/details?id=com.example.foodhub`

---

## 📊 Post-Launch Monitoring

### Check App Analytics
1. Go to **"Statistics"** section
2. Monitor:
   - Daily active users (DAU)
   - Installs
   - Uninstalls
   - Crashes
   - User reviews & ratings

### Common Metrics
- **Install rate** = (Installs / Impressions) × 100
- **Crash rate** = (Crashes / Sessions) × 100
- **Uninstall rate** = Track over time

### Respond to Reviews
1. Go to **"Reviews"**
2. Reply to user feedback
3. Address issues
4. Build trust

---

## 🔄 Step 11: Update APK (Future Versions)

When you want to update your app:

1. Bump version in `frontend-mobile/pubspec.yaml`:
   ```yaml
   version: 1.0.1+2  # major.minor.patch+code
   ```

2. Rebuild signed APK:
   ```bash
   flutter build apk --release
   ```

3. Upload new APK:
   - Go to **Production** in Play Console
   - Click **"Create new release"**
   - Upload new APK
   - Add version notes
   - Submit for review

> ℹ️ **Version code** must be higher than previous release (automatic)

---

## 🐛 Troubleshooting

### APK Upload Fails
```
❓ Error: "Signing certificate needed"
✅ Solution: Your APK is already signed with the keystore
         Verify: frontend-mobile/android/key.properties exists

❓ Error: File not found
✅ Solution: Build the APK first using:
         flutter build apk --release

❓ Error: "Invalid version code"
✅ Solution: Version code must be higher than previous
         Increment in pubspec.yaml (version: 1.0.X+CODE)
```

### App Review Rejected
```
Common rejection reasons & fixes:

❓ Frequent crashes
✅ Test thoroughly on Android device before uploading
✅ Check backend API is responding
✅ Review error logs

❓ Privacy policy missing
✅ Add privacy policy link in Content Rating section
✅ Ensure URL is publicly accessible

❓ Outdated design
✅ Follow Material Design 3 guidelines
✅ Update UI colors and layouts

❓ Misleading description
✅ Match your actual features
✅ Don't promise features you don't have

❓ Requires target API level 33+
✅ Update compileSdkVersion in build.gradle (already done)
✅ Test on Android 11+ device
```

### Low Install Rate
```
✅ Better screenshots (show real app usage)
✅ Improve description (highlight benefits)
✅ Better app icon (make it professional)
✅ Get reviews & ratings (ask first users)
✅ Use proper keywords in title/description
```

---

## 📝 Important Notes

### Keep Safe
```
🔐 KEEP THESE SAFE:
✓ Keystore: android_keystore/foodhub-release-key.jks
✓ Keystore password: foodhubkey123
✓ Key alias: foodhub
✓ Key password: foodhubkey123

⚠️ NEVER share your keystore file or passwords!
   You'll need them to update the app forever.
```

### Version Control
```
🔄 Before each update:
✓ Increment version code in pubspec.yaml
✓ Test on physical Android device
✓ Verify all features work
✓ Check for crashes/errors
✓ Update CHANGELOG.md
```

### Distribution
```
📢 After going live:
✓ Share Play Store link with friends
✓ Ask for reviews (star rating helps)
✓ Share on social media
✓ Submit to tech blogs/communities
✓ Monitor reviews & crashes
```

---

## 🎯 Timeline

| Step | Time | Status |
|------|------|--------|
| Developer Account | Instant | ✅ Can do now |
| App Setup | 30 min | ✅ Can do now |
| Screenshots | 1-2 hrs | ✅ Need to create |
| Privacy Policy | 15 min | ✅ Can do now |
| APK Review | 24-48 hrs | ⏳ Wait for Google |
| **TOTAL** | **2-3 days** | 🎉 **Live!!** |

---

## 🚀 Quick Start Summary

```
1. Create Google account ($25 fee)
2. Fill in app details & descriptions
3. Upload 2-5 screenshots
4. Add privacy policy URL
5. Upload signed APK file
6. Submit for review
7. Wait 24-48 hours
8. 🎉 APP IS LIVE!

APK File: backend/build/app/outputs/flutter-apk/app-release.apk
Backend: https://yumm-ym2m.onrender.com ✅ LIVE
Web: https://frontend-mobile-hymti8ny3-shahinshacs-projects.vercel.app ✅ LIVE
```

---

## 📞 Support Links

| Service | URL |
|---------|-----|
| **Google Play Console** | https://play.google.com/console |
| **Google Play Policies** | https://play.google.com/about/developer-content-policy/ |
| **Flutter Documentation** | https://flutter.dev/docs/deployment/android |
| **Android Studio** | https://developer.android.com/studio |

---

**Status:** ✅ **Ready to Deploy**
**Last Updated:** April 6, 2026
**Version:** FoodHub 1.0.0

🎉 **Your app is ready to launch on Google Play Store!**
