# 🍕 FoodHub - Fast Food Delivery App

A full-stack food delivery application built with **Flutter** (mobile & web), **Flask** backend, and **MongoDB** database.

---

## 🚀 Live Deployment

### **Frontend (Flutter Web)**
🌐 **Coming Soon on Netlify** - Currently deploying...

### **Backend API**
🔧 **https://yumm-ym2m.onrender.com** (Render)
- Health check: https://yumm-ym2m.onrender.com/api/health
- API docs: https://yumm-ym2m.onrender.com/api/version

---

## 🎯 Features

✅ **Customer Features**
- Google Sign-In for quick registration
- Browse restaurants & menus
- Place orders with real-time tracking
- Review & rate restaurants

✅ **Restaurant Features**
- Register and manage menu items
- View incoming orders
- Update order status (pending → preparing → ready → delivered)

✅ **Delivery Partner Features**
- Accept available delivery jobs
- Track deliveries in real-time
- Update delivery status

✅ **Admin Features**
- Approve new restaurant & delivery registrations
- Generate secure passwords for new users
- Manage system-wide settings

---

## 📱 Getting Started

### **Option 1: Access Web App (Share with Friends!)**
```
1. Visit: https://yummfoodhub.netlify.app
2. Partners can register and wait for admin approval.
3. Customers can sign in with Google Sign-In.
```

### **Option 2: Run Mobile App Locally**
```bash
# Clone repository
git clone https://github.com/Shahinshac/Yumm.git
cd Yumm/frontend-mobile

# Install dependencies
flutter pub get

# Run on Android/iOS/Web
flutter run              # Select device
flutter run -d chrome    # Run on web
```

### **Option 3: Test Backend API Directly**
```bash
# Health check
curl https://yumm-ym2m.onrender.com/api/health

# Admin login
curl -X POST https://yumm-ym2m.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ADMIN_USERNAME","password":"ADMIN_PASSWORD"}'
```

---

## 🏗️ Architecture

## 🏗️ Architecture

```
FoodHub/
├── frontend-mobile/          # Flutter app (Web, Android, iOS)
│   ├── lib/
│   │   ├── screens/          # UI screens
│   │   ├── providers/        # State management (Provider)
│   │   ├── services/         # HTTP & Google Sign-In services
│   │   └── core/             # Design system & widgets
│   └── pubspec.yaml
├── backend/                  # Flask API
│   ├── app/
│   │   ├── routes/           # API endpoints
│   │   ├── models/           # MongoDB models
│   │   ├── middleware/       # Auth & role checks
│   │   └── utils/            # Validators, security
│   └── requirements.txt
└── README.md
```

---

## 🔧 Tech Stack

**Frontend:**
- Flutter 3.x (Dart)
- Provider (state management)
- Dio (HTTP client)
- go_router (navigation)
- google_sign_in (authentication)

**Backend:**
- Flask (Python web framework)
- MongoEngine (MongoDB ODM)
- Flask-JWT-Extended (authentication)
- Flask-CORS (cross-origin requests)
- Flask-SocketIO (real-time updates)

**Database:**
- MongoDB Atlas (cloud database)

**Deployment:**
- Netlify (frontend)
- Render (backend API)
- Vercel (optional API hosting)

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/google-login` - Google Sign-In
- `POST /api/auth/register/restaurant` - Restaurant registration
- `POST /api/auth/register/delivery` - Delivery partner registration

### Admin
- `GET /api/admin/pending-users` - List pending approvals
- `POST /api/admin/approve/<user_id>` - Approve user & generate password
- `POST /api/admin/reject/<user_id>` - Reject registration

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/<id>` - Get restaurant details
- `POST /api/restaurants/<id>/menu` - Add menu item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/<id>` - Get order details
- `PUT /api/orders/<id>/status` - Update order status

### Health
- `GET /api/health` - Check backend status
- `GET /api/version` - Get API version

---

## 🚀 Deployment Guide

### Deploy Frontend (Netlify)
Netlify auto-deploys when you push to GitHub. Just wait 2-5 minutes for the first build!

**Access at:** `https://foodhub.netlify.app` (when ready)

### Deploy Backend (Render)
Already live at: `https://yumm-ym2m.onrender.com`

Push to GitHub → Render auto-deploys automatically.

---

## 🤝 Contributing

Want to add features? Fork the repo and submit a PR!

Areas to contribute:
- Add payment gateway integration
- Implement real-time chat between customer & delivery
- Enhance restaurant analytics dashboard
- Add more cuisine categories

---

## 📞 Support

**Issues with the app?**
- Check backend status: https://yumm-ym2m.onrender.com/api/health
- Create a GitHub issue: https://github.com/Shahinshac/Yumm/issues

**Questions about setup?**
- Email: admin@yumm.com
- GitHub: [@Shahinshac](https://github.com/Shahinshac)

---

## 📄 License

This project is open source and available under the MIT License.

---

## ✨ Acknowledgments

- Flutter team for the amazing cross-platform framework
- MongoDB for reliable cloud database
- Render & Netlify for free hosting

---

**Last Updated:** 2026-04-07
**Status:** ✅ Production Ready
